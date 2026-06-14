/**
 * Users API Tests
 *
 * Tests for user profile operations, social connections,
 * token balance, and voting history.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usersApi } from '../users';
import { initializeApiClient } from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('usersApi', () => {
  const baseUrl = 'https://api.test.com';

  beforeEach(() => {
    mockFetch.mockReset();
    initializeApiClient({ baseUrl });
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        municipality: 'kiryat-tivon',
        createdAt: '2025-01-01T00:00:00Z',
        identityScore: { total: 60, breakdown: { google: 40, facebook: 20, instagram: 0 }, level: 'verified' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ profile: mockProfile }),
      });

      const result = await usersApi.getProfile();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/profile`, {
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result).toEqual(mockProfile);
    });
  });

  describe('createProfile', () => {
    it('should create user profile', async () => {
      const input = {
        firstName: 'New',
        lastName: 'User',
        municipality: 'haifa',
      };

      const mockProfile = {
        id: 'user-456',
        email: 'new@example.com',
        ...input,
        createdAt: '2025-01-16T00:00:00Z',
        identityScore: { total: 40, breakdown: { google: 40, facebook: 0, instagram: 0 }, level: 'basic' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ profile: mockProfile }),
      });

      const result = await usersApi.createProfile(input);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/profile`, {
        method: 'POST',
        body: JSON.stringify(input),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.firstName).toBe('New');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const mockProfile = {
        id: 'user-123',
        firstName: 'Updated',
        lastName: 'Name',
        email: 'test@example.com',
        municipality: 'kiryat-tivon',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ profile: mockProfile }),
      });

      const result = await usersApi.updateProfile(updates);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/profile`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.firstName).toBe('Updated');
    });

    it('should update municipality', async () => {
      const updates = {
        municipality: 'tel-aviv',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ profile: { ...updates, id: 'user-123' } }),
      });

      const result = await usersApi.updateProfile(updates);

      expect(result.municipality).toBe('tel-aviv');
    });
  });

  describe('getSocialProofs', () => {
    it('should get user social proofs', async () => {
      const mockProofs = [
        {
          id: 'proof-1',
          platform: 'facebook',
          platformUserId: 'fb-123',
          displayName: 'FB User',
          createdAt: '2025-01-10T00:00:00Z',
        },
        {
          id: 'proof-2',
          platform: 'instagram',
          platformUserId: 'ig-456',
          displayName: 'IG User',
          createdAt: '2025-01-12T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ socialProofs: mockProofs }),
      });

      const result = await usersApi.getSocialProofs();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/social/proofs`, {
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result).toHaveLength(2);
      expect(result[0].platform).toBe('facebook');
    });

    it('should return empty array when no social proofs', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ socialProofs: [] }),
      });

      const result = await usersApi.getSocialProofs();

      expect(result).toEqual([]);
    });
  });

  describe('getSocialConnectUrl', () => {
    it('should return Facebook connect URL', async () => {
      // Mock window.location for browser environment
      const originalWindow = global.window;
      global.window = { location: { origin: 'https://app.taruu.co.il' } } as Window & typeof globalThis;

      const url = await usersApi.getSocialConnectUrl('facebook');

      expect(url).toBe('https://app.taruu.co.il/api/social/connect/facebook');

      global.window = originalWindow;
    });

    it('should return Instagram connect URL', async () => {
      const originalWindow = global.window;
      global.window = { location: { origin: 'https://app.taruu.co.il' } } as Window & typeof globalThis;

      const url = await usersApi.getSocialConnectUrl('instagram');

      expect(url).toBe('https://app.taruu.co.il/api/social/connect/instagram');

      global.window = originalWindow;
    });
  });

  describe('disconnectSocialAccount', () => {
    it('should disconnect Facebook account', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await usersApi.disconnectSocialAccount('facebook');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/social/proofs?platform=facebook`,
        {
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }
      );
    });

    it('should disconnect Instagram account', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await usersApi.disconnectSocialAccount('instagram');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/social/proofs?platform=instagram`,
        {
          method: 'DELETE',
          headers: expect.any(Object),
        }
      );
    });
  });

  describe('getTokenBalance', () => {
    it('should get token balance', async () => {
      const mockResponse = {
        balance: 150,
        walletAddress: '0x1234567890abcdef',
        transactions: [],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await usersApi.getTokenBalance();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/tokens`, {
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.balance).toBe(150);
      expect(result.walletAddress).toBe('0x1234567890abcdef');
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('getTokenTransactions', () => {
    it('should get token transactions', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          type: 'earned',
          amount: 1,
          description: 'Voted on issue #1',
          createdAt: '2025-01-10T00:00:00Z',
        },
        {
          id: 'tx-2',
          type: 'earned',
          amount: 1,
          description: 'Voted on issue #2',
          createdAt: '2025-01-12T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ transactions: mockTransactions }),
      });

      const result = await usersApi.getTokenTransactions();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/tokens/transactions`, {
        method: 'GET',
        headers: expect.any(Object),
      });
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(1);
    });
  });

  describe('getVotingHistory', () => {
    it('should get voting history with date conversion', async () => {
      const mockHistory = [
        { voteId: 'vote-1', optionId: 'opt-1', createdAt: '2025-01-10T00:00:00Z' },
        { voteId: 'vote-2', optionId: 'opt-2', createdAt: '2025-01-12T00:00:00Z' },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ history: mockHistory }),
      });

      const result = await usersApi.getVotingHistory();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/votes`, {
        method: 'GET',
        headers: expect.any(Object),
      });
      expect(result).toHaveLength(2);
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].voteId).toBe('vote-1');
    });
  });

  describe('verifyLocation', () => {
    it('should verify location successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          verified: true,
          municipality: 'kiryat-tivon',
        }),
      });

      const result = await usersApi.verifyLocation({
        latitude: 32.7128,
        longitude: 35.1196,
      });

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/verify-location`, {
        method: 'POST',
        body: JSON.stringify({
          latitude: 32.7128,
          longitude: 35.1196,
        }),
        headers: expect.any(Object),
      });
      expect(result.verified).toBe(true);
      expect(result.municipality).toBe('kiryat-tivon');
    });

    it('should return not verified for wrong location', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ verified: false }),
      });

      const result = await usersApi.verifyLocation({
        latitude: 40.7128,
        longitude: -74.0060,
      });

      expect(result.verified).toBe(false);
      expect(result.municipality).toBeUndefined();
    });
  });

  describe('getVoteStats', () => {
    it('should get vote statistics', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          votesParticipated: 25,
          votesCreated: 3,
        }),
      });

      const result = await usersApi.getVoteStats();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/user/stats`, {
        method: 'GET',
        headers: expect.any(Object),
      });
      expect(result.votesParticipated).toBe(25);
      expect(result.votesCreated).toBe(3);
    });
  });
});
