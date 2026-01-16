/**
 * Verification API Route Tests
 *
 * Tests for the /api/verification endpoints:
 * - POST /api/verification/start - Start 21-day verification
 * - GET /api/verification/status - Get verification status
 * - GET /api/verification/schedule - Get check-in schedule
 * - POST /api/verification/check-in - Perform GPS check-in
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as StartVerification } from '@/app/api/verification/start/route';

// Mock session service
vi.mock('@/services/auth/session', () => ({
  getSessionFromRequest: vi.fn(),
}));

// Mock database functions
vi.mock('@/lib/supabase/db', () => ({
  getUserById: vi.fn(),
  getActiveVerificationRun: vi.fn(),
  createVerificationRun: vi.fn(),
  createVerificationScheduleItems: vi.fn(),
  updateUser: vi.fn(),
  getVerificationSchedule: vi.fn(),
  createVerificationAttempt: vi.fn(),
  updateVerificationRun: vi.fn(),
  updateVerificationScheduleItem: vi.fn(),
}));

// Mock municipality service
vi.mock('@/services/verification/municipality', () => ({
  getMunicipalityBounds: vi.fn(),
  isPointInMunicipality: vi.fn(),
}));

// Import mocked modules
import { getSessionFromRequest } from '@/services/auth/session';
import {
  getUserById,
  getActiveVerificationRun,
  createVerificationRun,
  createVerificationScheduleItems,
  updateUser,
} from '@/lib/supabase/db';
import { getMunicipalityBounds } from '@/services/verification/municipality';

describe('Verification API Routes', () => {
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
    municipality_id: 'tel-aviv',
    verification_status: 'none',
    created_at: '2025-01-01T00:00:00Z',
  };

  const mockVerificationRun = {
    id: 'run-123',
    user_id: 'user-123',
    municipality_id: 'tel-aviv',
    status: 'active',
    total_check_ins: 6,
    completed_check_ins: 0,
    failed_check_ins: 0,
    started_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/verification/start', () => {
    it('should return 401 when not authenticated', async () => {
      (getSessionFromRequest as Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/verification/start', {
        method: 'POST',
      });
      const response = await StartVerification(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when user not found', async () => {
      (getSessionFromRequest as Mock).mockResolvedValue(mockSession);
      (getUserById as Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/verification/start', {
        method: 'POST',
      });
      const response = await StartVerification(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return 400 when no municipality selected', async () => {
      const userWithoutMunicipality = { ...mockUser, municipality_id: null };
      (getSessionFromRequest as Mock).mockResolvedValue(mockSession);
      (getUserById as Mock).mockResolvedValue(userWithoutMunicipality);

      const request = new NextRequest('http://localhost:3000/api/verification/start', {
        method: 'POST',
      });
      const response = await StartVerification(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('select a municipality');
    });

    it('should return 400 when municipality is invalid', async () => {
      (getSessionFromRequest as Mock).mockResolvedValue(mockSession);
      (getUserById as Mock).mockResolvedValue(mockUser);
      (getMunicipalityBounds as Mock).mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/verification/start', {
        method: 'POST',
      });
      const response = await StartVerification(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid municipality selected');
    });

    it('should return 400 when verification already in progress', async () => {
      (getSessionFromRequest as Mock).mockResolvedValue(mockSession);
      (getUserById as Mock).mockResolvedValue(mockUser);
      (getMunicipalityBounds as Mock).mockReturnValue({ /* polygon bounds */ });
      (getActiveVerificationRun as Mock).mockResolvedValue(mockVerificationRun);

      const request = new NextRequest('http://localhost:3000/api/verification/start', {
        method: 'POST',
      });
      const response = await StartVerification(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Verification is already in progress');
    });

    it('should return 400 when user already verified', async () => {
      const verifiedUser = { ...mockUser, verification_status: 'verified' };
      (getSessionFromRequest as Mock).mockResolvedValue(mockSession);
      (getUserById as Mock).mockResolvedValue(verifiedUser);
      (getMunicipalityBounds as Mock).mockReturnValue({ /* polygon bounds */ });
      (getActiveVerificationRun as Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/verification/start', {
        method: 'POST',
      });
      const response = await StartVerification(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already completed');
    });

    it('should start verification successfully', async () => {
      (getSessionFromRequest as Mock).mockResolvedValue(mockSession);
      (getUserById as Mock).mockResolvedValue(mockUser);
      (getMunicipalityBounds as Mock).mockReturnValue({
        coordinates: [[0, 0], [1, 0], [1, 1], [0, 1]],
      });
      (getActiveVerificationRun as Mock).mockResolvedValue(null);
      (createVerificationRun as Mock).mockResolvedValue(mockVerificationRun);
      (createVerificationScheduleItems as Mock).mockResolvedValue([
        { id: 'schedule-1', window_start: '2025-01-17T10:00:00Z', window_end: '2025-01-17T10:30:00Z' },
      ]);
      (updateUser as Mock).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/verification/start', {
        method: 'POST',
      });
      const response = await StartVerification(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.schedule).toBeDefined();
      expect(data.schedule.id).toBe('run-123');
      expect(data.schedule.municipality).toBe('tel-aviv');
      expect(data.schedule.totalCheckIns).toBeGreaterThanOrEqual(5);
      expect(data.schedule.totalCheckIns).toBeLessThanOrEqual(7);
      expect(data.verificationStatus.phase).toBe('in_progress');
      expect(createVerificationRun).toHaveBeenCalled();
      expect(createVerificationScheduleItems).toHaveBeenCalled();
      expect(updateUser).toHaveBeenCalledWith(mockUser.id, { verification_status: 'pending' });
    });

    it('should handle database errors gracefully', async () => {
      (getSessionFromRequest as Mock).mockResolvedValue(mockSession);
      (getUserById as Mock).mockResolvedValue(mockUser);
      (getMunicipalityBounds as Mock).mockReturnValue({ /* polygon bounds */ });
      (getActiveVerificationRun as Mock).mockResolvedValue(null);
      (createVerificationRun as Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/verification/start', {
        method: 'POST',
      });
      const response = await StartVerification(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to start verification');
    });
  });
});
