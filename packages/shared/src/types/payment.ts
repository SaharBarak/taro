/**
 * Payment Types - Stripe Integration
 */

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
export type PaymentType = 'vote' | 'create_vote';

// === Stripe Payment Types ===

export interface Payment {
  id: string;

  // Stripe
  stripePaymentIntentId: string;
  stripeCustomerId?: string;

  // Details
  userId: string;
  amount: number; // In agorot (cents)
  amountILS: number; // Human readable
  currency: 'ILS';

  type: PaymentType;
  status: PaymentStatus;

  // Metadata
  metadata: {
    voteId?: string;
    optionId?: string;
    voteTitle?: string;
  };

  // Tokens
  tokensAwarded: number;
  qubikTxHash?: string;

  createdAt: Date;
  processedAt?: Date;
}

export interface CreatePaymentIntentInput {
  amount: number; // In agorot (300 for vote, 20000 for create_vote)
  type: PaymentType;
  metadata: {
    voteId?: string;
    optionId?: string;
    voteTitle?: string;
  };
}

export interface CreatePaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: 'ILS';
}

// === Legacy Types (kept for compatibility) ===

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: 'ILS';
  status: PaymentStatus;
  paymentUrl?: string; // Optional - not used in Stripe flow
  clientSecret?: string; // NEW - Stripe client secret
  expiresAt?: Date;
}

export interface PaymentResult {
  id: string;
  amount: number;
  currency: 'ILS';
  status: 'succeeded' | 'failed';
  receiptUrl?: string;
  txHash: string;
  processedAt: Date;
}

// === Token Types ===

export interface TokenBalance {
  balance: number;
  walletAddress: string;
  lastUpdated: Date;
}

export interface TokenTransaction {
  id: string;
  type: 'mint' | 'transfer';
  amount: number;
  reason: PaymentType;
  txHash: string;
  timestamp: Date;
}

// === Pricing Constants ===

export const PAYMENT_AMOUNTS = {
  VOTE: 300, // ₪3 in agorot
  CREATE_VOTE: 20000, // ₪200 in agorot
} as const;

export const TOKEN_RATIO = 1; // 1 ILS = 1 SYNC token
