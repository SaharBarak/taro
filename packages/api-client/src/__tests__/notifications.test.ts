/**
 * Notifications API Tests
 *
 * Tests for push notification token registration and management.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notificationsApi } from '../notifications';
import { initializeApiClient } from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('notificationsApi', () => {
  const baseUrl = 'https://api.test.com';

  beforeEach(() => {
    mockFetch.mockReset();
    initializeApiClient({ baseUrl });
  });

  describe('registerPushToken', () => {
    it('should register iOS push token', async () => {
      const mockResponse = {
        success: true,
        tokenId: 'token-123',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await notificationsApi.registerPushToken(
        'ExponentPushToken[xxxxxx]',
        'ios',
        'iPhone 15 Pro'
      );

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/push-token`, {
        method: 'POST',
        body: JSON.stringify({
          token: 'ExponentPushToken[xxxxxx]',
          deviceType: 'ios',
          deviceName: 'iPhone 15 Pro',
        }),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.success).toBe(true);
      expect(result.tokenId).toBe('token-123');
    });

    it('should register Android push token without device name', async () => {
      const mockResponse = {
        success: true,
        tokenId: 'token-456',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await notificationsApi.registerPushToken(
        'ExponentPushToken[yyyyyy]',
        'android'
      );

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/push-token`, {
        method: 'POST',
        body: JSON.stringify({
          token: 'ExponentPushToken[yyyyyy]',
          deviceType: 'android',
          deviceName: undefined,
        }),
        headers: expect.any(Object),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getPushTokens', () => {
    it('should get all push tokens', async () => {
      const mockTokens = [
        {
          id: 'token-1',
          token: 'ExponentPushToken[xxx]',
          deviceType: 'ios',
          deviceName: 'iPhone 15',
          isActive: true,
          lastUsed: '2025-01-16T00:00:00Z',
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'token-2',
          token: 'ExponentPushToken[yyy]',
          deviceType: 'android',
          deviceName: 'Pixel 8',
          isActive: true,
          lastUsed: '2025-01-15T00:00:00Z',
          createdAt: '2025-01-05T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ tokens: mockTokens }),
      });

      const result = await notificationsApi.getPushTokens();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/push-token`, {
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.tokens).toHaveLength(2);
      expect(result.tokens[0].deviceType).toBe('ios');
    });

    it('should return empty array when no tokens', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ tokens: [] }),
      });

      const result = await notificationsApi.getPushTokens();

      expect(result.tokens).toEqual([]);
    });
  });

  describe('deletePushToken', () => {
    it('should delete push token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await notificationsApi.deletePushToken('ExponentPushToken[xxx]');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/user/push-token?token=${encodeURIComponent('ExponentPushToken[xxx]')}`,
        {
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }
      );
      expect(result.success).toBe(true);
    });

    it('should encode special characters in token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await notificationsApi.deletePushToken('ExponentPushToken[a+b=c]');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('token=ExponentPushToken%5Ba%2Bb%3Dc%5D'),
        expect.any(Object)
      );
    });
  });

  describe('deactivatePushToken', () => {
    it('should deactivate push token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await notificationsApi.deactivatePushToken('ExponentPushToken[yyy]');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/user/push-token?token=${encodeURIComponent('ExponentPushToken[yyy]')}&action=deactivate`,
        {
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }
      );
      expect(result.success).toBe(true);
    });
  });
});
