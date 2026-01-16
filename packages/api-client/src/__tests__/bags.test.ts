/**
 * Bags.fm SocialFi API Tests
 *
 * Tests for treasury operations and Issue Coin management.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bagsApi } from '../bags';
import { initializeApiClient, ApiError } from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('bagsApi', () => {
  const baseUrl = 'https://api.test.com';

  beforeEach(() => {
    mockFetch.mockReset();
    initializeApiClient({ baseUrl });
  });

  describe('getTreasury', () => {
    it('should get treasury balance for municipality', async () => {
      const mockTreasury = {
        municipalityId: 'kiryat-tivon',
        totalILS: 15000,
        totalSOL: 50,
        allocatedToVotes: 5000,
        availableForWithdrawal: 10000,
        lastUpdated: '2025-01-16T00:00:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ treasury: mockTreasury }),
      });

      const result = await bagsApi.getTreasury('kiryat-tivon');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/treasury/kiryat-tivon`,
        {
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }
      );
      expect(result.totalILS).toBe(15000);
      expect(result.municipalityId).toBe('kiryat-tivon');
    });

    it('should encode municipality ID in URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ treasury: { municipalityId: 'tel-aviv' } }),
      });

      await bagsApi.getTreasury('tel-aviv');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/treasury/tel-aviv`,
        expect.any(Object)
      );
    });
  });

  describe('getTreasuryTransactions', () => {
    it('should get treasury transactions', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          type: 'deposit',
          amountIls: 1000,
          amountSol: null,
          voteId: null,
          description: 'Payment received',
          createdAt: '2025-01-15T00:00:00Z',
        },
        {
          id: 'tx-2',
          type: 'allocation',
          amountIls: 500,
          amountSol: 2,
          voteId: 'vote-123',
          description: 'Allocated to vote',
          createdAt: '2025-01-16T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ transactions: mockTransactions, total: 2 }),
      });

      const result = await bagsApi.getTreasuryTransactions('kiryat-tivon');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/treasury/kiryat-tivon/transactions`,
        {
          method: 'GET',
          headers: expect.any(Object),
        }
      );
      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by type', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ transactions: [], total: 0 }),
      });

      await bagsApi.getTreasuryTransactions('kiryat-tivon', { type: 'deposit' });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/treasury/kiryat-tivon/transactions?type=deposit`,
        expect.any(Object)
      );
    });

    it('should paginate with limit and offset', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ transactions: [], total: 50 }),
      });

      await bagsApi.getTreasuryTransactions('haifa', { limit: 10, offset: 20 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=20'),
        expect.any(Object)
      );
    });
  });

  describe('getIssueCoin', () => {
    it('should get Issue Coin for vote', async () => {
      const mockIssueCoin = {
        id: 'coin-123',
        voteId: 'vote-456',
        tokenMint: 'ABC123...xyz',
        tokenName: 'Park Issue Coin',
        tokenSymbol: 'PARK',
        municipalityId: 'kiryat-tivon',
        totalPurchased: '1000000',
        totalValueILS: 50000,
        tradingEnabled: true,
        frozen: false,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ issueCoin: mockIssueCoin }),
      });

      const result = await bagsApi.getIssueCoin('vote-456');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/votes/vote-456/issue-coin`,
        {
          method: 'GET',
          headers: expect.any(Object),
        }
      );
      expect(result?.tokenMint).toBe('ABC123...xyz');
      expect(result?.tokenSymbol).toBe('PARK');
    });

    it('should return null when no Issue Coin exists', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ issueCoin: null }),
      });

      const result = await bagsApi.getIssueCoin('vote-without-coin');

      expect(result).toBeNull();
    });
  });

  describe('getIssueCoinHolders', () => {
    it('should get Issue Coin holders', async () => {
      const mockHolders = [
        {
          id: 'holder-1',
          issueCoinId: 'coin-123',
          walletAddress: '0xAAA...',
          tokenAmount: '5000',
          investedILS: 500,
          isLocalResident: true,
          createdAt: '2025-01-10T00:00:00Z',
          updatedAt: '2025-01-10T00:00:00Z',
        },
        {
          id: 'holder-2',
          issueCoinId: 'coin-123',
          walletAddress: '0xBBB...',
          tokenAmount: '3000',
          investedILS: 300,
          isLocalResident: false,
          createdAt: '2025-01-11T00:00:00Z',
          updatedAt: '2025-01-11T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ holders: mockHolders, total: 2 }),
      });

      const result = await bagsApi.getIssueCoinHolders('vote-123');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/votes/vote-123/issue-coin/holders`,
        {
          method: 'GET',
          headers: expect.any(Object),
        }
      );
      expect(result.holders).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should paginate holders', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ holders: [], total: 100 }),
      });

      await bagsApi.getIssueCoinHolders('vote-123', { limit: 20, offset: 40 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=20'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=40'),
        expect.any(Object)
      );
    });
  });

  describe('getQuote', () => {
    it('should get swap quote', async () => {
      const params = {
        inputMint: 'SOL',
        outputMint: 'PARK',
        amount: '1000000',
        slippageBps: 100,
      };

      const mockQuote = {
        inputAmount: '1000000',
        outputAmount: '950000',
        priceImpact: 0.005,
        fee: '1000',
        route: ['SOL', 'PARK'],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, quote: mockQuote }),
      });

      const result = await bagsApi.getQuote(params);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/bags/quote`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: expect.any(Object),
      });
      expect(result.inputAmount).toBe('1000000');
      expect(result.outputAmount).toBe('950000');
    });
  });

  describe('executeSwap', () => {
    it('should execute swap', async () => {
      const quote = {
        inputAmount: '1000000',
        outputAmount: '950000',
        priceImpact: 0.005,
        fee: '1000',
        route: ['SOL', 'PARK'],
      };

      const mockResult = {
        txSignature: '0x123abc...',
        inputAmount: '1000000',
        outputAmount: '948000',
        fee: '1000',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, result: mockResult }),
      });

      const result = await bagsApi.executeSwap(quote);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/api/bags/swap`, {
        method: 'POST',
        body: JSON.stringify({ quote }),
        headers: expect.any(Object),
      });
      expect(result.txSignature).toBe('0x123abc...');
    });
  });

  describe('hasIssueCoin', () => {
    it('should return true when Issue Coin exists', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ issueCoin: { id: 'coin-123' } }),
      });

      const result = await bagsApi.hasIssueCoin('vote-123');

      expect(result).toBe(true);
    });

    it('should return false when no Issue Coin', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ issueCoin: null }),
      });

      const result = await bagsApi.hasIssueCoin('vote-without-coin');

      expect(result).toBe(false);
    });
  });

  describe('getUserHolding', () => {
    it('should return user holding when exists', async () => {
      const mockHolding = {
        id: 'holding-123',
        issueCoinId: 'coin-123',
        userId: 'user-123',
        walletAddress: '0xUSER...',
        tokenAmount: '1000',
        investedILS: 100,
        isLocalResident: true,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ holding: mockHolding }),
      });

      const result = await bagsApi.getUserHolding('vote-123');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/votes/vote-123/issue-coin/my-holding`,
        {
          method: 'GET',
          headers: expect.any(Object),
        }
      );
      expect(result?.tokenAmount).toBe('1000');
    });

    it('should return null when user has no holding', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ holding: null }),
      });

      const result = await bagsApi.getUserHolding('vote-123');

      expect(result).toBeNull();
    });

    it('should return null on 404 error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      });

      const result = await bagsApi.getUserHolding('vote-nonexistent');

      expect(result).toBeNull();
    });
  });
});
