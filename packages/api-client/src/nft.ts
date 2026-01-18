/**
 * NFT API Client
 *
 * Client-side API for NFT-related operations.
 * Interfaces with our internal API routes for vote resolution and user NFT collections.
 */

import { getApiClient } from './client';
import type {
  VoteResolutionStatus,
  VoteNftDisplay,
  NftType,
} from '@sync/shared';

// === Vote Resolution API ===

export interface GetResolutionResponse {
  status: string;
  resolvedAt?: string;
  issueCoin?: {
    frozen: boolean;
    frozenAt?: string;
  };
  fees?: {
    total: number;
    claimed: boolean;
    claimedAt?: string;
  };
  nfts: {
    verifiedVoters: number;
    civicPatrons: number;
    total: number;
    minted: number;
    pending: number;
    failed: number;
  };
}

// === User NFTs API ===

export interface GetUserNftsParams {
  limit?: number;
  offset?: number;
  municipality?: string;
  type?: NftType;
}

export interface GetUserNftsResponse {
  nfts: VoteNftDisplay[];
  total: number;
}

// === API Client ===

export const nftApi = {
  /**
   * Get resolution status for a vote
   * @param voteId - Vote ID
   * @returns Resolution status including Issue Coin and NFT stats
   */
  async getResolution(voteId: string): Promise<GetResolutionResponse> {
    const client = getApiClient();
    return client.get<GetResolutionResponse>(`/votes/${voteId}/resolution`);
  },

  /**
   * Get user's NFT collection
   * @param params - Pagination and filter options
   * @returns List of user's minted NFTs
   */
  async getUserNfts(params?: GetUserNftsParams): Promise<GetUserNftsResponse> {
    const client = getApiClient();
    const searchParams = new URLSearchParams();

    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.municipality) searchParams.set('municipality', params.municipality);
    if (params?.type) searchParams.set('type', params.type);

    const query = searchParams.toString();
    return client.get<GetUserNftsResponse>(`/user/nfts${query ? `?${query}` : ''}`);
  },

  /**
   * Check if a vote has been resolved
   * @param voteId - Vote ID
   * @returns True if vote has been resolved
   */
  async isVoteResolved(voteId: string): Promise<boolean> {
    const resolution = await this.getResolution(voteId);
    return resolution.status === 'resolved';
  },

  /**
   * Get NFT count for a vote
   * @param voteId - Vote ID
   * @returns Total NFTs created for the vote
   */
  async getVoteNftCount(voteId: string): Promise<number> {
    const resolution = await this.getResolution(voteId);
    return resolution.nfts.total;
  },

  /**
   * Get user's total NFT count
   * @returns Total minted NFTs for the user
   */
  async getUserNftCount(): Promise<number> {
    const response = await this.getUserNfts({ limit: 1 });
    return response.total;
  },

  /**
   * Check if user has any NFTs
   * @returns True if user has at least one minted NFT
   */
  async hasNfts(): Promise<boolean> {
    const count = await this.getUserNftCount();
    return count > 0;
  },

  /**
   * Get user's NFTs filtered by type
   * @param type - NFT type filter
   * @param params - Additional pagination options
   * @returns Filtered list of NFTs
   */
  async getUserNftsByType(
    type: NftType,
    params?: Omit<GetUserNftsParams, 'type'>
  ): Promise<GetUserNftsResponse> {
    return this.getUserNfts({ ...params, type });
  },

  /**
   * Get user's NFTs for a specific municipality
   * @param municipality - Municipality ID
   * @param params - Additional pagination options
   * @returns Filtered list of NFTs
   */
  async getUserNftsByMunicipality(
    municipality: string,
    params?: Omit<GetUserNftsParams, 'municipality'>
  ): Promise<GetUserNftsResponse> {
    return this.getUserNfts({ ...params, municipality });
  },
};
