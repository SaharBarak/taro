/**
 * Payment Types - Paddle (Merchant of Record) Integration
 */

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentType = 'vote_participation' | 'vote_creation';

// === Paddle Payment Types ===

/** Paddle Billing webhook event names we handle */
export type PaddleEventType =
  | 'transaction.completed'
  | 'transaction.paid'
  | 'transaction.payment_failed'
  | 'transaction.ready'
  | 'adjustment.created';

/** Normalized webhook event consumed by the payments webhook route */
export interface PaymentWebhookEvent {
  type: 'payment.succeeded' | 'payment.failed' | 'refund.created';
  /** Paddle transaction id (txn_...) */
  paymentId: string;
  /** Amount in agorot (minor units) */
  amount: number;
  /** Flattened custom_data carried through checkout */
  metadata: Record<string, string>;
}

export interface Payment {
  id: string;

  // Paddle transaction id (txn_...)
  providerId: string;
  idempotencyKey: string;

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
  paymentId: string;
  paymentUrl: string;
  amount: number;
  currency: 'ILS';
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: 'ILS';
  status: PaymentStatus;
  paymentUrl: string;
  expiresAt?: Date;
}

export interface PaymentResult {
  id: string;
  amount: number;
  currency: 'ILS';
  status: 'completed' | 'failed';
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

// Note: Payment amounts in ILS are defined in @sync/shared/constants (VOTE_COST, CREATE_VOTE_COST)
// The backend converts to agorot (amount * 100) when storing payments.
// Paddle is the merchant of record; ILS settles to the platform bank account and is
// accrued per-vote in the treasury ledger, then batch-seeded into a Bags.fm bag at
// vote resolution (see services/treasury + services/nft).
