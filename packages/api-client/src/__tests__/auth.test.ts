/**
 * Auth API Tests
 *
 * Tests for session management and DID operations.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi } from '../auth';
import { initializeApiClient } from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('authApi', () => {
  const baseUrl = 'https://api.test.com';

  beforeEach(() => {
    mockFetch.mockReset();
    initializeApiClient({ baseUrl });
  });

  describe('getSession', () => {
    it('should return valid session', async () => {
      const mockResponse = {
        valid: true,
        session: {
          user: { id: 'user-123', email: 'test@example.com' },
          accessToken: 'access-token',
          expiresAt: '2025-01-20T00:00:00Z',
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.getSession();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/auth/session`, {
        method: 'POST',
        body: undefined,
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.valid).toBe(true);
      expect(result.session).toBeDefined();
    });

    it('should return invalid session with error', async () => {
      const mockResponse = {
        valid: false,
        error: 'Session expired',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.getSession();

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Session expired');
      expect(result.session).toBeUndefined();
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const mockResponse = {
        success: true,
        session: {
          user: { id: 'user-123', email: 'test@example.com' },
          accessToken: 'new-access-token',
          expiresAt: '2025-01-27T00:00:00Z',
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.refreshSession();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/auth/session/refresh`, {
        method: 'POST',
        body: undefined,
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
    });

    it('should return error on failed refresh', async () => {
      const mockResponse = {
        success: false,
        error: 'Refresh token invalid',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.refreshSession();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Refresh token invalid');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const mockResponse = { success: true };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.signOut();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/auth/session`, {
        method: 'DELETE',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getDid', () => {
    it('should return DID when set', async () => {
      const mockResponse = {
        did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        publicKey: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        createdAt: '2025-01-15T00:00:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.getDid();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/auth/did`, {
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.did).toBe('did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK');
      expect(result.publicKey).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should return null DID when not set', async () => {
      const mockResponse = {
        did: null,
        publicKey: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.getDid();

      expect(result.did).toBeNull();
      expect(result.publicKey).toBeNull();
    });
  });

  describe('setDid', () => {
    it('should set DID with required params', async () => {
      const params = {
        did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        publicKey: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
      };
      const mockResponse = {
        success: true,
        did: params.did,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.setDid(params);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/auth/did`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.success).toBe(true);
      expect(result.did).toBe(params.did);
    });

    it('should set DID with encrypted private key', async () => {
      const params = {
        did: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        publicKey: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        encryptedPrivateKey: 'encrypted-key-data',
      };
      const mockResponse = {
        success: true,
        did: params.did,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.setDid(params);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/auth/did`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.success).toBe(true);
    });
  });
});
