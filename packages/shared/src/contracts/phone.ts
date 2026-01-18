/**
 * Phone Verification API Contracts
 * Zod schemas for phone verification endpoints
 */

import { z } from 'zod';

// =============================================================================
// PHONE NUMBER VALIDATION
// =============================================================================

/**
 * Israeli phone number regex patterns
 * Mobile: +972 followed by 5X and 7 digits (e.g., +972501234567)
 * Landline: +972 followed by 2-9 and 7 digits (e.g., +97221234567)
 */
const ISRAELI_MOBILE_REGEX = /^\+972[5][0-9]{8}$/;
const ISRAELI_LANDLINE_REGEX = /^\+972[2-9][0-9]{7}$/;
const ISRAELI_PHONE_REGEX = /^\+972[0-9]{8,9}$/;

/**
 * Validates and normalizes Israeli phone numbers to E.164 format
 */
export const IsraeliPhoneSchema = z.string()
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
    message: 'מספר טלפון לא תקין',
  })
  .refine((val) => ISRAELI_MOBILE_REGEX.test(val) || ISRAELI_LANDLINE_REGEX.test(val), {
    message: 'יש להזין מספר טלפון ישראלי',
  });

/**
 * Verification code schema - 6 digits
 */
export const VerificationCodeSchema = z.string()
  .length(6, { message: 'קוד אימות חייב להכיל 6 ספרות' })
  .regex(/^[0-9]{6}$/, { message: 'קוד לא תקין' });

// =============================================================================
// POST /api/user/phone/send-code
// =============================================================================

export const SendCodeRequestSchema = z.object({
  phone: IsraeliPhoneSchema,
});

export const SendCodeSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  expiresIn: z.number().int().positive(),
});

export const SendCodeErrorResponseSchema = z.object({
  error: z.enum([
    'INVALID_PHONE',
    'NOT_ISRAELI_NUMBER',
    'RATE_LIMITED',
    'SMS_SEND_FAILED',
  ]),
  message: z.string(),
  retryAfter: z.number().int().optional(),
});

export const SendCodeResponseSchema = z.discriminatedUnion('success', [
  SendCodeSuccessResponseSchema.extend({ success: z.literal(true) }),
  SendCodeErrorResponseSchema.extend({ success: z.literal(false) }),
]);

export type SendCodeRequest = z.infer<typeof SendCodeRequestSchema>;
export type SendCodeSuccessResponse = z.infer<typeof SendCodeSuccessResponseSchema>;
export type SendCodeErrorResponse = z.infer<typeof SendCodeErrorResponseSchema>;
export type SendCodeResponse = z.infer<typeof SendCodeResponseSchema>;

// =============================================================================
// POST /api/user/phone/verify
// =============================================================================

export const VerifyCodeRequestSchema = z.object({
  phone: IsraeliPhoneSchema,
  code: VerificationCodeSchema,
});

export const VerifyCodeSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  verified: z.literal(true),
});

export const VerifyCodeErrorResponseSchema = z.object({
  error: z.enum([
    'INVALID_CODE',
    'CODE_EXPIRED',
    'WRONG_CODE',
    'NO_PENDING_VERIFICATION',
    'RATE_LIMITED',
  ]),
  message: z.string(),
  retryAfter: z.number().int().optional(),
});

export const VerifyCodeResponseSchema = z.discriminatedUnion('success', [
  VerifyCodeSuccessResponseSchema.extend({ success: z.literal(true) }),
  VerifyCodeErrorResponseSchema.extend({ success: z.literal(false) }),
]);

export type VerifyCodeRequest = z.infer<typeof VerifyCodeRequestSchema>;
export type VerifyCodeSuccessResponse = z.infer<typeof VerifyCodeSuccessResponseSchema>;
export type VerifyCodeErrorResponse = z.infer<typeof VerifyCodeErrorResponseSchema>;
export type VerifyCodeResponse = z.infer<typeof VerifyCodeResponseSchema>;

// =============================================================================
// GET /api/user/phone/status
// =============================================================================

export const PhoneStatusResponseSchema = z.object({
  verified: z.boolean(),
  phone: z.string().nullable(),
  verifiedAt: z.string().datetime().nullable(),
});

export type PhoneStatusResponse = z.infer<typeof PhoneStatusResponseSchema>;

// =============================================================================
// DATABASE TYPES
// =============================================================================

export const PhoneVerificationRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  phone: z.string(),
  verified: z.boolean(),
  verifiedAt: z.string().datetime().nullable(),
  attempts: z.number().int(),
  sendAttempts: z.number().int(),
  lastAttemptAt: z.string().datetime().nullable(),
  lastSendAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PhoneVerificationRecord = z.infer<typeof PhoneVerificationRecordSchema>;

// =============================================================================
// RATE LIMIT CHECK
// =============================================================================

export const RateLimitCheckResultSchema = z.object({
  allowed: z.boolean(),
  reason: z.enum([
    'hourly_limit',
    'phone_hourly_limit',
    'daily_limit',
    'too_many_attempts',
    'no_pending_verification',
  ]).optional(),
  retry_after: z.number().int().optional(),
});

export type RateLimitCheckResult = z.infer<typeof RateLimitCheckResultSchema>;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a phone number is a valid Israeli mobile number
 */
export function isIsraeliMobileNumber(phone: string): boolean {
  return ISRAELI_MOBILE_REGEX.test(phone);
}

/**
 * Check if a phone number is a valid Israeli landline number
 */
export function isIsraeliLandlineNumber(phone: string): boolean {
  return ISRAELI_LANDLINE_REGEX.test(phone);
}

/**
 * Normalize phone number to E.164 format
 * Returns null if the number cannot be normalized
 */
export function normalizePhoneNumber(phone: string): string | null {
  try {
    const result = IsraeliPhoneSchema.safeParse(phone);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
