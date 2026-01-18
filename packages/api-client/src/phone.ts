/**
 * Phone Verification API Client
 *
 * Handles phone number verification via SMS OTP.
 * Users can verify their Israeli phone number to increase identity score.
 */

import { getApiClient } from './client';
import type {
  SendCodeResponse,
  VerifyCodeResponse,
  PhoneVerificationStatus,
} from '@sync/shared';

/**
 * Request body for sending verification code
 */
export interface SendCodeRequest {
  phone: string;
}

/**
 * Request body for verifying code
 */
export interface VerifyCodeRequest {
  phone: string;
  code: string;
}

export const phoneApi = {
  /**
   * Send a verification SMS to the given phone number
   *
   * @param phone - Israeli phone number (will be normalized to E.164 format)
   * @returns Success response with expiry time, or error with retry info
   *
   * @example
   * ```typescript
   * const result = await phoneApi.sendCode('0501234567');
   * if (result.success) {
   *   console.log(`Code expires in ${result.expiresIn} seconds`);
   * }
   * ```
   */
  async sendCode(phone: string): Promise<SendCodeResponse> {
    const client = getApiClient();
    return client.post<SendCodeResponse>('/api/user/phone/send-code', { phone });
  },

  /**
   * Verify the SMS code sent to the user's phone
   *
   * @param phone - Phone number that received the code
   * @param code - 6-digit verification code
   * @returns Success response if verified, or error with details
   *
   * @example
   * ```typescript
   * const result = await phoneApi.verifyCode('0501234567', '123456');
   * if (result.success && result.verified) {
   *   console.log('Phone verified successfully');
   * }
   * ```
   */
  async verifyCode(phone: string, code: string): Promise<VerifyCodeResponse> {
    const client = getApiClient();
    return client.post<VerifyCodeResponse>('/api/user/phone/verify', { phone, code });
  },

  /**
   * Get the current phone verification status
   *
   * @returns Phone verification status including verified flag and timestamp
   *
   * @example
   * ```typescript
   * const status = await phoneApi.getStatus();
   * if (status.verified) {
   *   console.log(`Phone ${status.phone} verified at ${status.verifiedAt}`);
   * }
   * ```
   */
  async getStatus(): Promise<PhoneVerificationStatus> {
    const client = getApiClient();
    return client.get<PhoneVerificationStatus>('/api/user/phone/status');
  },
};
