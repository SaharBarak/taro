/**
 * Paddle Payment Service (Paddle Billing)
 *
 * Paddle is the Merchant of Record. It collects ILS from voters and settles
 * fiat to the platform bank account. We never touch card data.
 *
 * Flow:
 * - createVotePayment / createVoteCreationPayment -> creates a Paddle Transaction
 *   for a catalog Price and returns its hosted checkout URL.
 * - The Paddle webhook (transaction.completed) drives fulfilment server-side:
 *   mark payment completed, accrue ILS into the per-vote treasury ledger, mint
 *   SYNC tokens, record the vote. The accrued ILS is later batch-seeded into a
 *   Bags.fm bag at vote resolution.
 *
 * @see https://developer.paddle.com/api-reference/transactions/create-transaction
 * @see https://developer.paddle.com/webhooks/signature-verification
 */

import { createHmac, timingSafeEqual } from 'crypto';
import type { PaymentWebhookEvent, PaddleEventType } from '@sync/shared';
import { VOTE_COST, CREATE_VOTE_COST } from '@sync/shared';
import { logger } from '@/lib/logger';

// === Configuration ===

interface PaddleConfig {
  apiKey: string;
  webhookSecret: string;
  baseUrl: string;
  priceVoteParticipation: string;
  priceVoteCreation: string;
}

function resolveBaseUrl(): string {
  const env = (process.env.PADDLE_ENV || 'sandbox').toLowerCase();
  return env === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com';
}

const config: PaddleConfig = {
  apiKey: process.env.PADDLE_API_KEY || '',
  webhookSecret: process.env.PADDLE_WEBHOOK_SECRET || '',
  baseUrl: resolveBaseUrl(),
  priceVoteParticipation: process.env.PADDLE_PRICE_VOTE_PARTICIPATION || '',
  priceVoteCreation: process.env.PADDLE_PRICE_VOTE_CREATION || '',
};

// Payment amounts in ILS (source of truth lives in @sync/shared constants)
const VOTE_PARTICIPATION_AMOUNT = VOTE_COST; // ₪3
const VOTE_CREATION_AMOUNT = CREATE_VOTE_COST; // ₪200

// Maximum clock skew accepted for a webhook signature (seconds)
const MAX_SIGNATURE_AGE_SECONDS = 5 * 60;

// === Types ===

interface PaymentIntent {
  id: string; // Paddle transaction id (txn_...)
  amount: number;
  currency: 'ILS';
  status: 'pending';
  paymentUrl: string;
  expiresAt: Date;
}

interface PaymentResult {
  id: string;
  amount: number;
  currency: 'ILS';
  status: 'succeeded' | 'failed' | 'pending';
  receiptUrl?: string;
  txHash: string;
  processedAt: Date;
}

interface PaddleTransaction {
  id: string;
  status: string;
  custom_data?: Record<string, string> | null;
  checkout?: { url?: string | null } | null;
  invoice_id?: string | null;
  currency_code?: string;
  details?: {
    totals?: { grand_total?: string; total?: string };
  };
  billed_at?: string | null;
  created_at?: string;
}

// === Error Class ===

export class PaddleServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'PaddleServiceError';
  }
}

// === Helpers ===

async function paddleRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = (json as { error?: { code?: string; detail?: string } }).error;
    logger.error('Paddle API error', {
      endpoint,
      status: response.status,
      error: err,
    });
    throw new PaddleServiceError(
      err?.detail || `Paddle request failed with status ${response.status}`,
      err?.code || 'API_ERROR',
      response.status
    );
  }

  return (json as { data: T }).data;
}

function buildCustomData(
  metadata: Record<string, string | undefined>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(metadata).filter(([, v]) => v != null && v !== '')
  ) as Record<string, string>;
}

async function createTransaction(params: {
  priceId: string;
  customerEmail: string;
  customData: Record<string, string>;
  description: string;
}): Promise<PaymentIntent> {
  if (!params.priceId) {
    throw new PaddleServiceError(
      'Paddle price id not configured',
      'PRICE_NOT_CONFIGURED'
    );
  }

  const tx = await paddleRequest<PaddleTransaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      items: [{ price_id: params.priceId, quantity: 1 }],
      collection_mode: 'automatic',
      custom_data: params.customData,
      checkout: {
        // Hebrew-only app — return to the locale-prefixed finaliser.
        url: `${process.env.NEXT_PUBLIC_APP_URL}/he/payments/return`,
      },
    }),
  });

  const checkoutUrl = tx.checkout?.url;
  if (!checkoutUrl) {
    throw new PaddleServiceError(
      'Paddle did not return a checkout URL — configure a default payment link in the Paddle dashboard',
      'NO_CHECKOUT_URL'
    );
  }

  const amount = params.customData.type === 'vote_creation'
    ? VOTE_CREATION_AMOUNT
    : VOTE_PARTICIPATION_AMOUNT;

  return {
    id: tx.id,
    amount,
    currency: 'ILS',
    status: 'pending',
    paymentUrl: checkoutUrl,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  };
}

// === Service Methods ===

export function isConfigured(): boolean {
  return Boolean(config.apiKey && config.webhookSecret);
}

/**
 * Create a checkout for vote participation (₪3)
 */
export async function createVotePayment(params: {
  orderId: string;
  voteId: string;
  voteTitle?: string;
  userId: string;
  email: string;
  name: string;
  municipality?: string;
}): Promise<PaymentIntent> {
  return createTransaction({
    priceId: config.priceVoteParticipation,
    customerEmail: params.email,
    description: `השתתפות בהצבעה: ${params.voteTitle || params.voteId}`,
    customData: buildCustomData({
      orderId: params.orderId,
      voteId: params.voteId,
      userId: params.userId,
      type: 'vote_participation',
      municipality: params.municipality,
    }),
  });
}

/**
 * Create a checkout for vote creation (₪200)
 */
export async function createVoteCreationPayment(params: {
  orderId: string;
  voteTitle: string;
  userId: string;
  email: string;
  name: string;
  municipality?: string;
}): Promise<PaymentIntent> {
  return createTransaction({
    priceId: config.priceVoteCreation,
    customerEmail: params.email,
    description: `יצירת הצבעה: ${params.voteTitle || 'הצבעה חדשה'}`,
    customData: buildCustomData({
      orderId: params.orderId,
      voteTitle: params.voteTitle,
      userId: params.userId,
      type: 'vote_creation',
      municipality: params.municipality,
    }),
  });
}

/**
 * Get the current status of a Paddle transaction.
 * Best-effort receipt URL is fetched from the transaction's invoice.
 */
export async function getPaymentStatus(
  transactionId: string
): Promise<PaymentResult> {
  const tx = await paddleRequest<PaddleTransaction>(
    `/transactions/${transactionId}`
  );

  const succeeded = ['completed', 'paid', 'billed'].includes(tx.status);
  const failed = ['canceled', 'past_due'].includes(tx.status);

  let receiptUrl: string | undefined;
  if (succeeded) {
    receiptUrl = await getInvoiceUrl(transactionId).catch(() => undefined);
  }

  const totalMinor = tx.details?.totals?.grand_total || tx.details?.totals?.total;

  return {
    id: tx.id,
    amount: totalMinor ? parseInt(totalMinor, 10) : 0,
    currency: 'ILS',
    status: succeeded ? 'succeeded' : failed ? 'failed' : 'pending',
    receiptUrl,
    txHash: tx.id,
    processedAt: new Date(tx.billed_at || tx.created_at || Date.now()),
  };
}

/**
 * Fetch the hosted PDF invoice URL for a completed transaction.
 */
export async function getInvoiceUrl(transactionId: string): Promise<string> {
  const data = await paddleRequest<{ url: string }>(
    `/transactions/${transactionId}/invoice`
  );
  return data.url;
}

/**
 * Verify a Paddle webhook signature.
 * Header format: `Paddle-Signature: ts=<unix>;h1=<hex hmac>`
 * Signed payload = `${ts}:${rawBody}` with HMAC-SHA256(secret).
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string
): boolean {
  if (!config.webhookSecret) {
    logger.warn('Paddle webhook secret not configured');
    return false;
  }
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(';').map((kv) => {
      const idx = kv.indexOf('=');
      return [kv.slice(0, idx).trim(), kv.slice(idx + 1).trim()];
    })
  );

  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  // Reject stale signatures (replay protection)
  const age = Math.floor(Date.now() / 1000) - parseInt(ts, 10);
  if (!Number.isFinite(age) || Math.abs(age) > MAX_SIGNATURE_AGE_SECONDS) {
    logger.warn('Paddle webhook signature timestamp out of range', { age });
    return false;
  }

  const expected = createHmac('sha256', config.webhookSecret)
    .update(`${ts}:${rawBody}`)
    .digest('hex');

  const a = Buffer.from(h1, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Normalize a Paddle webhook payload into our internal event shape.
 */
export function parseWebhookEvent(payload: {
  event_type?: PaddleEventType | string;
  data?: PaddleTransaction & { action?: string };
}): PaymentWebhookEvent {
  const data = payload.data || ({} as PaddleTransaction);
  const eventType = payload.event_type;

  let type: PaymentWebhookEvent['type'];
  switch (eventType) {
    case 'transaction.completed':
    case 'transaction.paid':
      type = 'payment.succeeded';
      break;
    case 'transaction.payment_failed':
      type = 'payment.failed';
      break;
    case 'adjustment.created':
      type = 'refund.created';
      break;
    default:
      type = 'payment.failed';
  }

  const totalMinor = data.details?.totals?.grand_total || data.details?.totals?.total;

  return {
    type,
    paymentId: data.id,
    amount: totalMinor ? parseInt(totalMinor, 10) : 0,
    metadata: (data.custom_data || {}) as Record<string, string>,
  };
}

// === Exports ===

export function getPaymentAmounts() {
  return {
    voteParticipation: VOTE_PARTICIPATION_AMOUNT, // ₪3
    voteCreation: VOTE_CREATION_AMOUNT, // ₪200
    currency: 'ILS' as const,
  };
}

export const paddleService = {
  isConfigured,
  createVotePayment,
  createVoteCreationPayment,
  getPaymentStatus,
  getInvoiceUrl,
  verifyWebhookSignature,
  parseWebhookEvent,
};

export { VOTE_PARTICIPATION_AMOUNT, VOTE_CREATION_AMOUNT };
export type { PaymentIntent, PaymentResult };
export default paddleService;
