/**
 * Phone Verification Types
 *
 * TypeScript interfaces for SMS-based phone verification.
 * Used for verifying Israeli phone numbers via Twilio.
 */

/**
 * Phone verification record from database
 */
export interface PhoneVerification {
  id: string;
  userId: string;
  phone: string;
  verified: boolean;
  verifiedAt: Date | null;
  attempts: number;
  sendAttempts: number;
  lastAttemptAt: Date | null;
  lastSendAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Phone verification status response
 */
export interface PhoneVerificationStatus {
  verified: boolean;
  phone: string | null;
  verifiedAt: string | null;
}

/**
 * Send verification code request
 */
export interface SendCodeRequest {
  phone: string;
}

/**
 * Send verification code response
 */
export interface SendCodeResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
  error?: PhoneVerificationErrorCode;
  retryAfter?: number;
}

/**
 * Verify code request
 */
export interface VerifyCodeRequest {
  phone: string;
  code: string;
}

/**
 * Verify code response
 */
export interface VerifyCodeResponse {
  success: boolean;
  message: string;
  verified?: boolean;
  error?: PhoneVerificationErrorCode;
  retryAfter?: number;
}

/**
 * Phone verification error codes
 */
export type PhoneVerificationErrorCode =
  | 'INVALID_PHONE'
  | 'NOT_ISRAELI_NUMBER'
  | 'RATE_LIMITED'
  | 'SMS_SEND_FAILED'
  | 'INVALID_CODE'
  | 'CODE_EXPIRED'
  | 'WRONG_CODE'
  | 'NO_PENDING_VERIFICATION';

/**
 * Phone verification error response
 */
export interface PhoneVerificationError {
  error: PhoneVerificationErrorCode;
  message: string;
  retryAfter?: number;
}

/**
 * Rate limit check result from database function
 */
export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: 'hourly_limit' | 'phone_hourly_limit' | 'daily_limit' | 'too_many_attempts' | 'no_pending_verification';
  retryAfter?: number;
}

/**
 * Hebrew error messages for phone verification
 */
export const PHONE_ERROR_MESSAGES: Record<PhoneVerificationErrorCode, string> = {
  INVALID_PHONE: 'מספר טלפון לא תקין',
  NOT_ISRAELI_NUMBER: 'יש להזין מספר טלפון ישראלי',
  RATE_LIMITED: 'נסיונות רבים מדי, נסה שוב מאוחר יותר',
  SMS_SEND_FAILED: 'שליחת ההודעה נכשלה',
  INVALID_CODE: 'קוד לא תקין',
  CODE_EXPIRED: 'פג תוקף הקוד',
  WRONG_CODE: 'קוד שגוי',
  NO_PENDING_VERIFICATION: 'לא נמצא תהליך אימות פעיל',
};

/**
 * Hebrew success messages for phone verification
 */
export const PHONE_SUCCESS_MESSAGES = {
  CODE_SENT: 'קוד אימות נשלח',
  PHONE_VERIFIED: 'מספר הטלפון אומת בהצלחה',
} as const;
