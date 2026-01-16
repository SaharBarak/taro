/**
 * Verification API Client
 *
 * Handles GPS verification process for residency verification.
 * Users must complete 5-7 check-ins over 21 days to verify residency.
 */

import { getApiClient } from './client';
import type { VerificationSchedule, VerificationStatus, GpsCoordinates } from '@sync/shared';

// Response types matching API endpoints
export interface StartVerificationResponse {
  success: boolean;
  schedule: {
    id: string;
    municipality: string;
    periodStart: string;
    periodEnd: string;
    totalCheckIns: number;
  };
}

export interface GetVerificationStatusResponse {
  status: VerificationStatus;
  schedule?: VerificationSchedule;
}

export interface GetVerificationScheduleResponse {
  schedule: VerificationSchedule | null;
  nextCheckIn?: {
    windowStart: string;
    windowEnd: string;
  };
}

export interface CheckInResponse {
  success: boolean;
  checkIn: {
    id: string;
    windowStart: string;
    windowEnd: string;
    completed: boolean;
    location?: GpsCoordinates;
  };
  progress: {
    completed: number;
    total: number;
    remaining: number;
  };
  message?: string;
}

export const verificationApi = {
  /**
   * Start the 21-day GPS verification process
   */
  async start(): Promise<StartVerificationResponse> {
    const client = getApiClient();
    return client.post<StartVerificationResponse>('/api/verification/start');
  },

  /**
   * Get current verification status
   */
  async getStatus(): Promise<GetVerificationStatusResponse> {
    const client = getApiClient();
    return client.get<GetVerificationStatusResponse>('/api/verification/status');
  },

  /**
   * Get verification schedule with check-in windows
   */
  async getSchedule(): Promise<GetVerificationScheduleResponse> {
    const client = getApiClient();
    return client.get<GetVerificationScheduleResponse>('/api/verification/schedule');
  },

  /**
   * Perform a GPS check-in during an active verification window
   */
  async checkIn(coordinates: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: number;
  }): Promise<CheckInResponse> {
    const client = getApiClient();
    return client.post<CheckInResponse>('/api/verification/check-in', coordinates);
  },
};
