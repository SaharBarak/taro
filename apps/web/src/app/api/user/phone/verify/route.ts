/**
 * POST /api/user/phone/verify
 *
 * Verify the SMS code sent to the user's phone.
 * On success, marks the phone as verified in the user's profile.
 *
 * Rate limits:
 * - 5 verification attempts per phone per 10 minutes
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionFromRequest } from '@/services/auth/session';
import { getUserByGoogleId } from '@/lib/supabase/db';
import { supabaseAdmin } from '@/lib/supabase/server';
import { checkVerificationCode, isSmsServiceConfigured } from '@/services/sms/twilio';
import { PHONE_ERROR_MESSAGES, PHONE_SUCCESS_MESSAGES } from '@sync/shared';

// Phone validation regex for Israeli numbers
const ISRAELI_PHONE_REGEX = /^\+972[0-9]{8,9}$/;
const ISRAELI_MOBILE_REGEX = /^\+972[5][0-9]{8}$/;
const ISRAELI_LANDLINE_REGEX = /^\+972[2-9][0-9]{7}$/;

// Request schema
const VerifyCodeRequestSchema = z.object({
  phone: z.string()
    .transform((val) => {
      // Remove all whitespace, dashes, and parentheses
      let normalized = val.replace(/[\s\-\(\)]/g, '');

      // Convert local format (05X...) to E.164 (+972...)
      if (normalized.startsWith('05')) {
        normalized = '+972' + normalized.slice(1);
      } else if (normalized.startsWith('0')) {
        normalized = '+972' + normalized.slice(1);
      }

      // Ensure + prefix
      if (!normalized.startsWith('+')) {
        normalized = '+' + normalized;
      }

      return normalized;
    })
    .refine((val) => ISRAELI_PHONE_REGEX.test(val), {
      message: PHONE_ERROR_MESSAGES.INVALID_PHONE,
    })
    .refine((val) => ISRAELI_MOBILE_REGEX.test(val) || ISRAELI_LANDLINE_REGEX.test(val), {
      message: PHONE_ERROR_MESSAGES.NOT_ISRAELI_NUMBER,
    }),
  code: z.string()
    .length(6, { message: PHONE_ERROR_MESSAGES.INVALID_CODE })
    .regex(/^[0-9]{6}$/, { message: PHONE_ERROR_MESSAGES.INVALID_CODE }),
});

// Type for phone verification record (not in generated types yet)
interface PhoneVerificationRow {
  id: string;
  user_id: string;
  phone: string;
  verified: boolean;
  verified_at: string | null;
  attempts: number;
  send_attempts: number;
  last_attempt_at: string | null;
  last_send_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if SMS service is configured
    if (!isSmsServiceConfigured()) {
      console.error('Twilio SMS service is not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'SMS_SEND_FAILED',
          message: 'SMS service is not available',
        },
        { status: 503 }
      );
    }

    // Verify user is authenticated
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserByGoogleId(session.googleId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = VerifyCodeRequestSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0];
      const isCodeError = firstError?.path.includes('code');
      const errorCode = isCodeError ? 'INVALID_CODE' : 'INVALID_PHONE';
      const errorMessage = firstError?.message || PHONE_ERROR_MESSAGES[errorCode];

      return NextResponse.json(
        {
          success: false,
          error: errorCode,
          message: errorMessage,
        },
        { status: 400 }
      );
    }

    const { phone, code } = parseResult.data;

    // Get current verification record
    const { data: verificationData, error: fetchError } = await supabaseAdmin
      .from('phone_verifications' as 'users') // Type assertion workaround
      .select('attempts, last_attempt_at, last_send_at')
      .eq('user_id', user.id)
      .single();

    const verification = verificationData as unknown as Pick<PhoneVerificationRow, 'attempts' | 'last_attempt_at' | 'last_send_at'> | null;

    // Check if there's a pending verification
    if (!verification || !verification.last_send_at || fetchError) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_PENDING_VERIFICATION',
          message: PHONE_ERROR_MESSAGES.NO_PENDING_VERIFICATION,
        },
        { status: 400 }
      );
    }

    // Check rate limit - max 5 attempts per 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const lastAttemptAt = verification.last_attempt_at ? new Date(verification.last_attempt_at) : null;

    if (lastAttemptAt && lastAttemptAt > tenMinutesAgo && verification.attempts >= 5) {
      const retryAfter = Math.ceil((lastAttemptAt.getTime() + 10 * 60 * 1000 - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMITED',
          message: PHONE_ERROR_MESSAGES.RATE_LIMITED,
          retryAfter,
        },
        { status: 429 }
      );
    }

    // Record the verification attempt
    const newAttempts = lastAttemptAt && lastAttemptAt > tenMinutesAgo
      ? verification.attempts + 1
      : 1; // Reset if last attempt was more than 10 minutes ago

    await supabaseAdmin
      .from('phone_verifications' as 'users') // Type assertion workaround
      .update({
        attempts: newAttempts,
        last_attempt_at: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq('user_id' as never, user.id as never);

    // Verify the code with Twilio
    const result = await checkVerificationCode(phone, code);

    if (!result.verified) {
      const errorCode = result.error || 'WRONG_CODE';
      return NextResponse.json(
        {
          success: false,
          error: errorCode,
          message: PHONE_ERROR_MESSAGES[errorCode],
        },
        { status: 400 }
      );
    }

    // Mark phone as verified in phone_verifications table
    const { error: verificationUpdateError } = await supabaseAdmin
      .from('phone_verifications' as 'users') // Type assertion workaround
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq('user_id' as never, user.id as never);

    if (verificationUpdateError) {
      console.error('Error updating phone_verifications:', verificationUpdateError);
    }

    // Mark phone as verified in users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({
        phone: phone,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq('id', user.id);

    if (userError) {
      console.error('Error updating user phone status:', userError);
      // Return success anyway - Twilio verification succeeded
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: PHONE_SUCCESS_MESSAGES.PHONE_VERIFIED,
      verified: true,
    });
  } catch (error: unknown) {
    console.error('Error in verify endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'WRONG_CODE',
        message: PHONE_ERROR_MESSAGES.WRONG_CODE,
      },
      { status: 500 }
    );
  }
}
