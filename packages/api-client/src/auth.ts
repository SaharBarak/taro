/**
 * Auth API Client
 *
 * Handles session management and DID operations.
 */

import { getApiClient } from './client';
import type { AuthSession } from '@sync/shared';

// Response types matching API endpoints
export interface GetSessionResponse {
  valid: boolean;
  session?: AuthSession;
  error?: string;
}

export interface RefreshSessionResponse {
  success: boolean;
  session?: AuthSession;
  error?: string;
}

export interface SignOutResponse {
  success: boolean;
}

export interface GetDidResponse {
  did: string | null;
  publicKey: string | null;
  createdAt?: string;
}

export interface SetDidResponse {
  success: boolean;
  did: string;
}

export const authApi = {
  /**
   * Get current session status
   */
  async getSession(): Promise<GetSessionResponse> {
    const client = getApiClient();
    return client.post<GetSessionResponse>('/api/auth/session');
  },

  /**
   * Refresh the current session token
   */
  async refreshSession(): Promise<RefreshSessionResponse> {
    const client = getApiClient();
    return client.post<RefreshSessionResponse>('/api/auth/session/refresh');
  },

  /**
   * Sign out and invalidate session
   */
  async signOut(): Promise<SignOutResponse> {
    const client = getApiClient();
    return client.delete<SignOutResponse>('/api/auth/session');
  },

  /**
   * Get user's DID (Decentralized Identifier)
   */
  async getDid(): Promise<GetDidResponse> {
    const client = getApiClient();
    return client.get<GetDidResponse>('/api/auth/did');
  },

  /**
   * Set or update user's DID
   */
  async setDid(params: {
    did: string;
    publicKey: string;
    encryptedPrivateKey?: string;
  }): Promise<SetDidResponse> {
    const client = getApiClient();
    return client.post<SetDidResponse>('/api/auth/did', params);
  },
};
