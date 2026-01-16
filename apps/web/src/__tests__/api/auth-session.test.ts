/**
 * Auth Session API Route Tests
 *
 * Tests for the /api/auth/session endpoints:
 * - POST /api/auth/session - Validate session
 * - DELETE /api/auth/session - Sign out
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, DELETE } from '@/app/api/auth/session/route';

// Mock session service
vi.mock('@/services/auth/session', () => ({
  getSessionFromRequest: vi.fn(),
  clearSessionCookies: vi.fn(),
}));

// Mock database functions
vi.mock('@/lib/supabase/db', () => ({
  getUserById: vi.fn(),
  getSocialProofsByUserId: vi.fn(),
}));

// Import mocked modules
import { getSessionFromRequest, clearSessionCookies } from '@/services/auth/session';
import { getUserById, getSocialProofsByUserId } from '@/lib/supabase/db';

describe('Auth Session API Routes', () => {
  const mockSession = {
    userId: 'user-123',
    googleId: 'google-123',
    email: 'test@example.com',
    did: 'did:sync:' + 'a'.repeat(43),
    expiresAt: Date.now() + 86400000,
  };

  const mockUser = {
    id: 'user-123',
    google_id: 'google-123',
    did: 'did:sync:' + 'a'.repeat(43),
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    avatar_url: 'https://example.com/avatar.jpg',
    identity_score: 70,
    verification_status: 'verified',
    municipality_id: 'tel-aviv',
    created_at: '2025-01-01T00:00:00Z',
  };

  const mockSocialProofs = [
    { provider: 'google', provider_id: 'google-123' },
    { provider: 'facebook', provider_id: 'facebook-456' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/session', () => {
    it('should return 401 when session is invalid', async () => {
      (getSessionFromRequest as Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid session');
      expect(data.code).toBe('INVALID_SESSION');
    });

    it('should return 404 when user not found', async () => {
      (getSessionFromRequest as Mock).mockResolvedValue(mockSession);
      (getUserById as Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
      expect(data.code).toBe('USER_NOT_FOUND');
    });

    it('should validate session and return user data successfully', async () => {
      (getSessionFromRequest as Mock).mockResolvedValue(mockSession);
      (getUserById as Mock).mockResolvedValue(mockUser);
      (getSocialProofsByUserId as Mock).mockResolvedValue(mockSocialProofs);

      const request = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe('user-123');
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.firstName).toBe('Test');
      expect(data.user.lastName).toBe('User');
      expect(data.user.identityScore).toBe(70);
      expect(data.user.verificationStatus).toBe('verified');
      expect(data.user.municipality).toBe('tel-aviv');
      expect(data.user.socialProofs).toEqual(['google', 'facebook']);
      expect(data.session).toBeDefined();
      expect(data.session.userId).toBe('user-123');
    });

    it('should handle database errors gracefully', async () => {
      (getSessionFromRequest as Mock).mockResolvedValue(mockSession);
      (getUserById as Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'POST',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Session validation failed');
      expect(data.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('DELETE /api/auth/session', () => {
    it('should sign out successfully', async () => {
      (clearSessionCookies as Mock).mockResolvedValue(undefined);

      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Signed out successfully');
      expect(clearSessionCookies).toHaveBeenCalledTimes(1);
    });

    it('should handle sign out errors gracefully', async () => {
      (clearSessionCookies as Mock).mockRejectedValue(new Error('Failed to clear cookies'));

      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Sign out failed');
      expect(data.code).toBe('SIGNOUT_FAILED');
    });
  });
});
