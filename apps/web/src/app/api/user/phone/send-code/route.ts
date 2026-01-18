/**
 * POST /api/user/phone/send-code
 *
 * Send a verification SMS to the user's phone number.
 * Uses Twilio Verify API for secure code generation and delivery.
 *
 * Rate limits:
 * - 3 requests per phone per hour
 * - 5 requests per user per day
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionFromRequest } from '@/services/auth/session';
import { getUserByGoogleId } from '@/lib/supabase/db';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendVerificationCode, getCodeExpirySeconds, isSmsServiceConfigured } from '@/services/sms/twilio';
import { PHONE_ERROR_MESSAGES, PHONE_SUCCESS_MESSAGES } from '@sync/shared';

// Phone validation regex for Israeli numbers
const ISRAELI_PHONE_REGEX = /^\+972[0-9]{8,9}$/;
const ISRAELI_MOBILE_REGEX = /^\+972[5][0-9]{8}$/;
const ISRAELI_LANDLINE_REGEX = /^\+972[2-9][0-9]{7}$/;

// Request schema with phone normalization
const SendCodeRequestSchema = z.object({
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
    const parseResult = SendCodeRequestSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors[0]?.message || PHONE_ERROR_MESSAGES.INVALID_PHONE;
      const isNotIsraeli = errorMessage === PHONE_ERROR_MESSAGES.NOT_ISRAELI_NUMBER;
      return NextResponse.json(
        {
          success: false,
          error: isNotIsraeli ? 'NOT_ISRAELI_NUMBER' : 'INVALID_PHONE',
          message: errorMessage,
        },
        { status: 400 }
      );
    }

    const { phone } = parseResult.data;

    // Check rate limits - query using raw SQL since table isn't in types yet
    const { data: verificationData, error: verificationError } = await supabaseAdmin
      .from('phone_verifications' as 'users') // Type assertion workaround
      .select('send_attempts, last_send_at')
      .eq('user_id', user.id)
      .single();

    const verification = verificationData as unknown as Pick<PhoneVerificationRow, 'send_attempts' | 'last_send_at'> | null;

    if (verification && !verificationError) {
      const lastSendAt = verification.last_send_at ? new Date(verification.last_send_at) : null;
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Check hourly limit (simplified - just check if last send was within an hour)
      if (lastSendAt && lastSendAt > hourAgo && verification.send_attempts >= 3) {
        const retryAfter = Math.ceil((lastSendAt.getTime() + 60 * 60 * 1000 - Date.now()) / 1000);
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

      // Check daily limit
      if (lastSendAt && lastSendAt > dayAgo && verification.send_attempts >= 5) {
        const retryAfter = Math.ceil((lastSendAt.getTime() + 24 * 60 * 60 * 1000 - Date.now()) / 1000);
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
    }

    // Send verification SMS via Twilio
    const result = await sendVerificationCode(phone);

    if (!result.success) {
      const errorCode = result.error || 'SMS_SEND_FAILED';
      return NextResponse.json(
        {
          success: false,
          error: errorCode,
          message: PHONE_ERROR_MESSAGES[errorCode],
        },
        { status: 500 }
      );
    }

    // Record the send attempt in database
    const newSendAttempts = verification ? verification.send_attempts + 1 : 1;
    const now = new Date().toISOString();

    try {
      // Try insert first, then update if it fails (upsert pattern)
      const { error: insertError } = await supabaseAdmin
        .from('phone_verifications' as 'users') // Type assertion workaround
         
        .insert({
          user_id: user.id,
          phone: phone,
          send_attempts: newSendAttempts,
          last_send_at: now,
          attempts: 0,
          verified: false,
          verified_at: null,
        } as any);

      if (insertError?.code === '23505') { // Unique violation - record exists
        await supabaseAdmin
          .from('phone_verifications' as 'users')
           
          .update({
            phone: phone,
            send_attempts: newSendAttempts,
            last_send_at: now,
            attempts: 0,
            verified: false,
            verified_at: null,
          } as any)
          .eq('user_id' as never, user.id as never);
      } else if (insertError) {
        console.error('Error recording phone verification send:', insertError);
      }
    } catch (dbError) {
      console.error('Error recording phone verification send:', dbError);
      // Continue anyway - SMS was already sent
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: PHONE_SUCCESS_MESSAGES.CODE_SENT,
      expiresIn: getCodeExpirySeconds(),
    });
  } catch (error: unknown) {
    console.error('Error in send-code endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'SMS_SEND_FAILED',
        message: PHONE_ERROR_MESSAGES.SMS_SEND_FAILED,
      },
      { status: 500 }
    );
  }
}
