/**
 * Twilio SMS Verification Service
 *
 * Handles phone number verification via Twilio Verify API.
 * Uses Twilio Verify service for automatic code generation,
 * rate limiting, delivery tracking, and code validation.
 */

import twilio from 'twilio';
import type { PHONE_ERROR_MESSAGES } from '@sync/shared';

// Environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

// Check if Twilio is configured
const isTwilioConfigured = Boolean(
  TWILIO_ACCOUNT_SID &&
  TWILIO_AUTH_TOKEN &&
  TWILIO_VERIFY_SERVICE_SID
);

// Create Twilio client (only if configured)
const client = isTwilioConfigured
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

/**
 * Verification status from Twilio
 */
export type TwilioVerificationStatus =
  | 'pending'    // Verification created, awaiting code
  | 'approved'   // Code verified successfully
  | 'canceled'   // Verification canceled
  | 'expired';   // Verification expired

/**
 * Result of sending a verification code
 */
export interface SendVerificationResult {
  success: boolean;
  status?: TwilioVerificationStatus;
  error?: keyof typeof PHONE_ERROR_MESSAGES;
  errorMessage?: string;
}

/**
 * Result of checking a verification code
 */
export interface CheckVerificationResult {
  success: boolean;
  verified: boolean;
  status?: TwilioVerificationStatus;
  error?: keyof typeof PHONE_ERROR_MESSAGES;
  errorMessage?: string;
}

/**
 * Send a verification SMS to the given phone number
 *
 * @param phone - Phone number in E.164 format (e.g., +972501234567)
 * @returns Result indicating success/failure
 */
export async function sendVerificationCode(
  phone: string
): Promise<SendVerificationResult> {
  // Check if Twilio is configured
  if (!client || !TWILIO_VERIFY_SERVICE_SID) {
    console.error('Twilio SMS service is not configured');
    return {
      success: false,
      error: 'SMS_SEND_FAILED',
      errorMessage: 'SMS service is not configured',
    };
  }

  try {
    const verification = await client.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phone,
        channel: 'sms',
        locale: 'he', // Hebrew locale for SMS content
      });

    console.log(`Verification SMS sent to ${phone}, status: ${verification.status}`);

    return {
      success: true,
      status: verification.status as TwilioVerificationStatus,
    };
  } catch (error: unknown) {
    console.error('Error sending verification SMS:', error);

    // Handle Twilio-specific errors
    if (error instanceof Error && 'code' in error) {
      const twilioError = error as Error & { code: number; message: string };

      // Common Twilio error codes
      switch (twilioError.code) {
        case 60200: // Invalid parameter
        case 60203: // Max send attempts reached
          return {
            success: false,
            error: 'RATE_LIMITED',
            errorMessage: twilioError.message,
          };
        case 60205: // SMS not supported for this phone number
        case 60212: // Invalid phone number
          return {
            success: false,
            error: 'INVALID_PHONE',
            errorMessage: twilioError.message,
          };
        default:
          return {
            success: false,
            error: 'SMS_SEND_FAILED',
            errorMessage: twilioError.message,
          };
      }
    }

    return {
      success: false,
      error: 'SMS_SEND_FAILED',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check a verification code against Twilio
 *
 * @param phone - Phone number in E.164 format
 * @param code - 6-digit verification code
 * @returns Result indicating if the code was valid
 */
export async function checkVerificationCode(
  phone: string,
  code: string
): Promise<CheckVerificationResult> {
  // Check if Twilio is configured
  if (!client || !TWILIO_VERIFY_SERVICE_SID) {
    console.error('Twilio SMS service is not configured');
    return {
      success: false,
      verified: false,
      error: 'SMS_SEND_FAILED',
      errorMessage: 'SMS service is not configured',
    };
  }

  try {
    const verificationCheck = await client.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: phone,
        code: code,
      });

    console.log(`Verification check for ${phone}, status: ${verificationCheck.status}`);

    const status = verificationCheck.status as TwilioVerificationStatus;
    const verified = status === 'approved';

    if (verified) {
      return {
        success: true,
        verified: true,
        status,
      };
    }

    // Handle specific non-approved statuses
    if (status === 'expired') {
      return {
        success: false,
        verified: false,
        status,
        error: 'CODE_EXPIRED',
        errorMessage: 'Verification code has expired',
      };
    }

    if (status === 'canceled') {
      return {
        success: false,
        verified: false,
        status,
        error: 'NO_PENDING_VERIFICATION',
        errorMessage: 'Verification was canceled',
      };
    }

    // Code was wrong (status is still 'pending')
    return {
      success: false,
      verified: false,
      status,
      error: 'WRONG_CODE',
      errorMessage: 'Incorrect verification code',
    };
  } catch (error: unknown) {
    console.error('Error checking verification code:', error);

    // Handle Twilio-specific errors
    if (error instanceof Error && 'code' in error) {
      const twilioError = error as Error & { code: number; message: string };

      // Common Twilio error codes for verification checks
      switch (twilioError.code) {
        case 20404: // Verification not found
          return {
            success: false,
            verified: false,
            error: 'NO_PENDING_VERIFICATION',
            errorMessage: 'No pending verification found',
          };
        case 60202: // Max attempts reached
          return {
            success: false,
            verified: false,
            error: 'RATE_LIMITED',
            errorMessage: 'Too many verification attempts',
          };
        default:
          return {
            success: false,
            verified: false,
            error: 'WRONG_CODE',
            errorMessage: twilioError.message,
          };
      }
    }

    return {
      success: false,
      verified: false,
      error: 'WRONG_CODE',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cancel a pending verification (optional cleanup)
 *
 * @param phone - Phone number in E.164 format
 */
export async function cancelVerification(phone: string): Promise<void> {
  if (!client || !TWILIO_VERIFY_SERVICE_SID) {
    return;
  }

  try {
    // Twilio doesn't have a direct cancel endpoint, but we can
    // let the verification expire naturally (10 minutes)
    console.log(`Verification for ${phone} will expire automatically`);
  } catch (error) {
    console.error('Error canceling verification:', error);
  }
}

/**
 * Check if Twilio SMS service is properly configured
 */
export function isSmsServiceConfigured(): boolean {
  return isTwilioConfigured;
}

/**
 * Get verification code expiry time in seconds
 * Twilio Verify codes expire after 10 minutes by default
 */
export function getCodeExpirySeconds(): number {
  return 600; // 10 minutes
}
