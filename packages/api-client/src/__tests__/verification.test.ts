/**
 * Verification API Tests
 *
 * Tests for GPS verification process for residency verification.
 * Users must complete 5-7 check-ins over 21 days.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { verificationApi } from '../verification';
import { initializeApiClient } from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('verificationApi', () => {
  const baseUrl = 'https://api.test.com';

  beforeEach(() => {
    mockFetch.mockReset();
    initializeApiClient({ baseUrl });
  });

  describe('start', () => {
    it('should start verification process', async () => {
      const mockResponse = {
        success: true,
        schedule: {
          id: 'schedule-123',
          municipality: 'kiryat-tivon',
          periodStart: '2025-01-16T00:00:00Z',
          periodEnd: '2025-02-06T00:00:00Z',
          totalCheckIns: 6,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verificationApi.start();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/verification/start`, {
        method: 'POST',
        body: undefined,
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.success).toBe(true);
      expect(result.schedule.totalCheckIns).toBe(6);
      expect(result.schedule.municipality).toBe('kiryat-tivon');
    });
  });

  describe('getStatus', () => {
    it('should get verification status with active schedule', async () => {
      const mockResponse = {
        status: {
          phase: 'in_progress',
          checkInsCompleted: 3,
          checkInsTotal: 6,
          startedAt: '2025-01-16T00:00:00Z',
        },
        schedule: {
          id: 'schedule-123',
          municipality: 'kiryat-tivon',
          checkIns: [
            { windowStart: '2025-01-16T08:00:00Z', windowEnd: '2025-01-16T10:00:00Z', completed: true },
            { windowStart: '2025-01-19T08:00:00Z', windowEnd: '2025-01-19T10:00:00Z', completed: true },
            { windowStart: '2025-01-22T08:00:00Z', windowEnd: '2025-01-22T10:00:00Z', completed: true },
          ],
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verificationApi.getStatus();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/verification/status`, {
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.status.phase).toBe('in_progress');
      expect(result.status.checkInsCompleted).toBe(3);
      expect(result.schedule).toBeDefined();
    });

    it('should get verification status without schedule', async () => {
      const mockResponse = {
        status: {
          phase: 'not_started',
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verificationApi.getStatus();

      expect(result.status.phase).toBe('not_started');
      expect(result.schedule).toBeUndefined();
    });

    it('should return completed status', async () => {
      const mockResponse = {
        status: {
          phase: 'completed',
          checkInsCompleted: 6,
          checkInsTotal: 6,
          startedAt: '2025-01-01T00:00:00Z',
          completedAt: '2025-01-20T09:00:00Z',
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verificationApi.getStatus();

      expect(result.status.phase).toBe('completed');
      expect(result.status.checkInsCompleted).toBe(6);
    });
  });

  describe('getSchedule', () => {
    it('should get verification schedule with next check-in', async () => {
      const mockResponse = {
        schedule: {
          id: 'schedule-123',
          municipality: 'kiryat-tivon',
          periodStart: '2025-01-16T00:00:00Z',
          periodEnd: '2025-02-06T00:00:00Z',
          checkIns: [
            {
              id: 'checkin-1',
              windowStart: '2025-01-16T08:00:00Z',
              windowEnd: '2025-01-16T22:00:00Z',
              completed: true,
            },
            {
              id: 'checkin-2',
              windowStart: '2025-01-19T08:00:00Z',
              windowEnd: '2025-01-19T22:00:00Z',
              completed: false,
            },
          ],
        },
        nextCheckIn: {
          windowStart: '2025-01-19T08:00:00Z',
          windowEnd: '2025-01-19T22:00:00Z',
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verificationApi.getSchedule();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/verification/schedule`, {
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.schedule).toBeDefined();
      expect(result.nextCheckIn).toBeDefined();
      expect(result.nextCheckIn?.windowStart).toBe('2025-01-19T08:00:00Z');
    });

    it('should return null schedule when not started', async () => {
      const mockResponse = {
        schedule: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verificationApi.getSchedule();

      expect(result.schedule).toBeNull();
      expect(result.nextCheckIn).toBeUndefined();
    });
  });

  describe('checkIn', () => {
    it('should perform successful check-in', async () => {
      const coordinates = {
        latitude: 32.7128,
        longitude: 35.1196,
        accuracy: 15,
      };

      const mockResponse = {
        success: true,
        checkIn: {
          id: 'checkin-123',
          windowStart: '2025-01-16T08:00:00Z',
          windowEnd: '2025-01-16T22:00:00Z',
          completed: true,
          location: coordinates,
        },
        progress: {
          completed: 3,
          total: 6,
          remaining: 3,
        },
        message: 'Check-in successful!',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verificationApi.checkIn(coordinates);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/verification/check-in`, {
        method: 'POST',
        body: JSON.stringify(coordinates),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(result.success).toBe(true);
      expect(result.checkIn.completed).toBe(true);
      expect(result.progress.completed).toBe(3);
      expect(result.progress.remaining).toBe(3);
    });

    it('should include optional timestamp', async () => {
      const coordinates = {
        latitude: 32.7128,
        longitude: 35.1196,
        timestamp: Date.now(),
      };

      const mockResponse = {
        success: true,
        checkIn: {
          id: 'checkin-123',
          windowStart: '2025-01-16T08:00:00Z',
          windowEnd: '2025-01-16T22:00:00Z',
          completed: true,
        },
        progress: {
          completed: 1,
          total: 6,
          remaining: 5,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await verificationApi.checkIn(coordinates);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/verification/check-in`, {
        method: 'POST',
        body: JSON.stringify(coordinates),
        headers: expect.any(Object),
      });
    });

    it('should handle check-in outside window', async () => {
      const mockResponse = {
        success: false,
        checkIn: {
          id: 'checkin-123',
          windowStart: '2025-01-16T08:00:00Z',
          windowEnd: '2025-01-16T22:00:00Z',
          completed: false,
        },
        progress: {
          completed: 2,
          total: 6,
          remaining: 4,
        },
        message: 'Check-in window is not active',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verificationApi.checkIn({
        latitude: 32.7128,
        longitude: 35.1196,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Check-in window is not active');
    });

    it('should handle check-in at wrong location', async () => {
      const mockResponse = {
        success: false,
        checkIn: {
          id: 'checkin-123',
          windowStart: '2025-01-16T08:00:00Z',
          windowEnd: '2025-01-16T22:00:00Z',
          completed: false,
        },
        progress: {
          completed: 2,
          total: 6,
          remaining: 4,
        },
        message: 'Location is outside the municipality boundaries',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verificationApi.checkIn({
        latitude: 40.7128, // Wrong location (NYC)
        longitude: -74.0060,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('outside');
    });
  });
});
