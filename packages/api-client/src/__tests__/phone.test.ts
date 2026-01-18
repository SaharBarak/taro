/**
 * Phone Verification API Tests
 *
 * Tests for phone number verification via SMS OTP.
 * Users verify their Israeli phone number to increase identity score.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { phoneApi } from '../phone';
import { initializeApiClient } from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('phoneApi', () => {
  const baseUrl = 'https://api.test.com';

  beforeEach(() => {
    mockFetch.mockReset();
    initializeApiClient({ baseUrl });
  });

  describe('sendCode', () => {
    it('should send verification code successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'קוד אימות נשלח בהצלחה',
        expiresIn: 600,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.sendCode('0501234567');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/phone/send-code`, {
        method: 'POST',
        body: JSON.stringify({ phone: '0501234567' }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.success).toBe(true);
      expect(result.expiresIn).toBe(600);
    });

    it('should send code with E.164 format phone number', async () => {
      const mockResponse = {
        success: true,
        message: 'קוד אימות נשלח בהצלחה',
        expiresIn: 600,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.sendCode('+972501234567');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/phone/send-code`, {
        method: 'POST',
        body: JSON.stringify({ phone: '+972501234567' }),
        headers: expect.any(Object),
      });
      expect(result.success).toBe(true);
    });

    it('should handle rate limiting', async () => {
      const mockResponse = {
        success: false,
        error: 'RATE_LIMITED',
        message: 'נשלחו יותר מדי הודעות. נסו שוב מאוחר יותר',
        retryAfter: 3600,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.sendCode('0501234567');

      expect(result.success).toBe(false);
      expect(result.error).toBe('RATE_LIMITED');
      expect(result.retryAfter).toBe(3600);
    });

    it('should handle invalid phone number', async () => {
      const mockResponse = {
        success: false,
        error: 'INVALID_PHONE',
        message: 'מספר טלפון לא תקין',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.sendCode('invalid-phone');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_PHONE');
    });

    it('should handle non-Israeli phone number', async () => {
      const mockResponse = {
        success: false,
        error: 'NOT_ISRAELI_NUMBER',
        message: 'יש להזין מספר טלפון ישראלי',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.sendCode('+14155551234');

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_ISRAELI_NUMBER');
    });

    it('should handle SMS send failure', async () => {
      const mockResponse = {
        success: false,
        error: 'SMS_SEND_FAILED',
        message: 'שליחת ההודעה נכשלה. נסו שוב',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.sendCode('0501234567');

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMS_SEND_FAILED');
    });
  });

  describe('verifyCode', () => {
    it('should verify code successfully', async () => {
      const mockResponse = {
        success: true,
        verified: true,
        message: 'הטלפון אומת בהצלחה',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.verifyCode('0501234567', '123456');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/phone/verify`, {
        method: 'POST',
        body: JSON.stringify({ phone: '0501234567', code: '123456' }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
    });

    it('should handle wrong verification code', async () => {
      const mockResponse = {
        success: false,
        verified: false,
        error: 'WRONG_CODE',
        message: 'קוד שגוי. נסו שוב',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.verifyCode('0501234567', '000000');

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.error).toBe('WRONG_CODE');
    });

    it('should handle expired verification code', async () => {
      const mockResponse = {
        success: false,
        verified: false,
        error: 'CODE_EXPIRED',
        message: 'הקוד פג תוקף. בקשו קוד חדש',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.verifyCode('0501234567', '123456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('CODE_EXPIRED');
    });

    it('should handle no pending verification', async () => {
      const mockResponse = {
        success: false,
        verified: false,
        error: 'NO_PENDING_VERIFICATION',
        message: 'לא נמצא קוד אימות פעיל. בקשו קוד חדש',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.verifyCode('0501234567', '123456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_PENDING_VERIFICATION');
    });

    it('should handle rate limiting on verify attempts', async () => {
      const mockResponse = {
        success: false,
        verified: false,
        error: 'RATE_LIMITED',
        message: 'יותר מדי ניסיונות. נסו שוב מאוחר יותר',
        retryAfter: 600,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.verifyCode('0501234567', '123456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('RATE_LIMITED');
      expect(result.retryAfter).toBe(600);
    });

    it('should handle invalid code format', async () => {
      const mockResponse = {
        success: false,
        verified: false,
        error: 'INVALID_CODE',
        message: 'קוד האימות חייב להכיל 6 ספרות',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.verifyCode('0501234567', '12345'); // Only 5 digits

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_CODE');
    });
  });

  describe('getStatus', () => {
    it('should return verified status', async () => {
      const mockResponse = {
        verified: true,
        phone: '+972501234567',
        verifiedAt: '2025-01-16T10:30:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.getStatus();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/phone/status`, {
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.verified).toBe(true);
      expect(result.phone).toBe('+972501234567');
      expect(result.verifiedAt).toBe('2025-01-16T10:30:00Z');
    });

    it('should return unverified status', async () => {
      const mockResponse = {
        verified: false,
        phone: null,
        verifiedAt: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.getStatus();

      expect(result.verified).toBe(false);
      expect(result.phone).toBeNull();
      expect(result.verifiedAt).toBeNull();
    });

    it('should hide phone number when not verified', async () => {
      const mockResponse = {
        verified: false,
        phone: null,
        verifiedAt: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await phoneApi.getStatus();

      expect(result.verified).toBe(false);
      expect(result.phone).toBeNull();
    });
  });
});
