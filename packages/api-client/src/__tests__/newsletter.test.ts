/**
 * Newsletter API Tests
 *
 * Tests for newsletter subscription via Beehiiv.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { newsletterApi } from '../newsletter';
import { initializeApiClient, ApiError } from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('newsletterApi', () => {
  const baseUrl = 'https://api.test.com';

  beforeEach(() => {
    mockFetch.mockReset();
    initializeApiClient({ baseUrl });
  });

  describe('subscribe', () => {
    it('should subscribe email successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Successfully subscribed to newsletter' }),
      });

      const result = await newsletterApi.subscribe('test@example.com');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.message).toContain('Successfully');
    });

    it('should handle already subscribed', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Email already subscribed', code: 'ALREADY_SUBSCRIBED' }),
      });

      await expect(newsletterApi.subscribe('existing@example.com')).rejects.toThrow(ApiError);

      try {
        await newsletterApi.subscribe('existing@example.com');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(409);
        expect((error as ApiError).code).toBe('ALREADY_SUBSCRIBED');
      }
    });

    it('should handle rate limiting', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ message: 'Too many requests', code: 'RATE_LIMITED' }),
      });

      await expect(newsletterApi.subscribe('spam@example.com')).rejects.toThrow(ApiError);

      try {
        await newsletterApi.subscribe('spam@example.com');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(429);
      }
    });

    it('should handle invalid email', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid email format', code: 'INVALID_EMAIL' }),
      });

      await expect(newsletterApi.subscribe('not-an-email')).rejects.toThrow(ApiError);
    });
  });
});
