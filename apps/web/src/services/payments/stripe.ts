/**
 * Stripe Payment Service
 *
 * Handles payment processing for:
 * - Vote participation (₪3)
 * - Vote creation (₪200)
 *
 * Integrates with:
 * - Qubik for token minting (1 ILS = 1 SYNC token)
 * - Resend for payment receipts
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

// Payment amounts in agorot (1/100 of ILS)
const VOTE_PARTICIPATION_AMOUNT = 300; // ₪3
const VOTE_CREATION_AMOUNT = 20000; // ₪200

interface CreatePaymentIntentParams {
  type: 'vote_participation' | 'vote_creation';
  userId: string;
  userEmail: string;
  voteId?: string;
  voteTitle?: string;
  municipality?: string;
}

interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

interface PaymentStatus {
  id: string;
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_action' | 'canceled' | 'requires_confirmation';
  amount: number;
  currency: string;
  metadata: Record<string, string>;
  receiptUrl?: string;
}

/**
 * Create a Stripe PaymentIntent for vote participation or creation
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResult> {
  const { type, userId, userEmail, voteId, voteTitle, municipality } = params;

  const amount =
    type === 'vote_participation' ? VOTE_PARTICIPATION_AMOUNT : VOTE_CREATION_AMOUNT;

  const description =
    type === 'vote_participation'
      ? `השתתפות בהצבעה: ${voteTitle || voteId}`
      : `יצירת הצבעה: ${voteTitle || 'הצבעה חדשה'}`;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'ils',
    description,
    receipt_email: userEmail,
    metadata: {
      type,
      userId,
      voteId: voteId || '',
      voteTitle: voteTitle || '',
      municipality: municipality || '',
      tokensToMint: String(amount / 100), // 1 ILS = 1 SYNC token
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    id: paymentIntent.id,
    clientSecret: paymentIntent.client_secret || '',
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
  };
}

/**
 * Get payment status by PaymentIntent ID
 */
export async function getPaymentStatus(paymentIntentId: string): Promise<PaymentStatus> {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  let receiptUrl: string | undefined;
  if (paymentIntent.latest_charge) {
    const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
    receiptUrl = charge.receipt_url || undefined;
  }

  return {
    id: paymentIntent.id,
    status: paymentIntent.status as PaymentStatus['status'],
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata as Record<string, string>,
    receiptUrl,
  };
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Process successful payment
 * Called after webhook confirms payment succeeded
 */
export async function processSuccessfulPayment(
  paymentIntent: Stripe.PaymentIntent
): Promise<{
  success: boolean;
  tokensToMint: number;
  type: string;
  userId: string;
  voteId?: string;
}> {
  const metadata = paymentIntent.metadata;
  const tokensToMint = parseInt(metadata.tokensToMint || '0', 10);

  return {
    success: true,
    tokensToMint,
    type: metadata.type,
    userId: metadata.userId,
    voteId: metadata.voteId || undefined,
  };
}

/**
 * Create Stripe Customer for a user (optional, for saved cards)
 */
export async function createOrGetCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // Check if customer already exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

/**
 * Get payment amounts
 */
export function getPaymentAmounts() {
  return {
    voteParticipation: VOTE_PARTICIPATION_AMOUNT / 100, // ₪3
    voteCreation: VOTE_CREATION_AMOUNT / 100, // ₪200
    currency: 'ILS',
  };
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
    return true;
  } catch (error) {
    console.error('Error canceling payment intent:', error);
    return false;
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<{
  success: boolean;
  refundId?: string;
  error?: string;
}> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason,
    });

    return {
      success: true,
      refundId: refund.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create refund',
    };
  }
}

export { stripe };
export type { PaymentIntentResult, PaymentStatus, CreatePaymentIntentParams };
