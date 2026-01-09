import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSessionFromRequest } from '@/services/auth/session';
import { convergeService } from '@/services/converge';
import {
  greenInvoiceService,
  getPaymentAmounts,
} from '@/services/payments/greenInvoice';

interface CreatePaymentRequest {
  type: 'vote_participation' | 'vote_creation';
  voteId?: string;
  voteTitle?: string;
}

/**
 * POST /api/payments/create
 * Create a Green Invoice payment form for vote participation or creation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreatePaymentRequest = await request.json();
    const { type, voteId, voteTitle } = body;

    // Validate payment type
    if (!type || !['vote_participation', 'vote_creation'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      );
    }

    // For vote participation, voteId is required
    if (type === 'vote_participation' && !voteId) {
      return NextResponse.json(
        { error: 'Vote ID is required for participation payment' },
        { status: 400 }
      );
    }

    const user = await convergeService.getUserByGoogleId(session.googleId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check identity score for voting
    if (type === 'vote_participation' && (user.identityScore?.total || 0) < 40) {
      return NextResponse.json(
        { error: 'Insufficient identity score to vote. Minimum 40 required.' },
        { status: 403 }
      );
    }

    // Check verification status for voting
    if (
      type === 'vote_participation' &&
      user.verificationStatus?.phase !== 'completed'
    ) {
      return NextResponse.json(
        { error: 'GPS verification required before voting' },
        { status: 403 }
      );
    }

    // Generate unique order ID
    const orderId = uuidv4();

    // Create Green Invoice payment form
    let paymentIntent;

    if (type === 'vote_participation') {
      paymentIntent = await greenInvoiceService.createVotePayment({
        orderId,
        voteId: voteId!,
        voteTitle,
        userId: user.id,
        email: user.email,
        name: user.name || user.email,
        municipality: user.municipality,
      });
    } else {
      paymentIntent = await greenInvoiceService.createVoteCreationPayment({
        orderId,
        voteTitle: voteTitle || 'הצבעה חדשה',
        userId: user.id,
        email: user.email,
        name: user.name || user.email,
        municipality: user.municipality,
      });
    }

    const amounts = getPaymentAmounts();

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentIntent.id,
        orderId,
        paymentUrl: paymentIntent.paymentUrl,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        expiresAt: paymentIntent.expiresAt.toISOString(),
      },
      pricing: {
        amount: type === 'vote_participation' ? amounts.voteParticipation : amounts.voteCreation,
        currency: amounts.currency,
        syncTokens: type === 'vote_participation' ? amounts.voteParticipation : amounts.voteCreation,
        description:
          type === 'vote_participation'
            ? 'השתתפות בהצבעה'
            : 'יצירת הצבעה חדשה',
      },
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/create
 * Get payment pricing information
 */
export async function GET() {
  const amounts = getPaymentAmounts();

  return NextResponse.json({
    pricing: {
      voteParticipation: {
        amount: amounts.voteParticipation,
        currency: amounts.currency,
        syncTokens: amounts.voteParticipation,
        description: 'השתתפות בהצבעה',
      },
      voteCreation: {
        amount: amounts.voteCreation,
        currency: amounts.currency,
        syncTokens: amounts.voteCreation,
        description: 'יצירת הצבעה חדשה',
      },
    },
    tokenRate: {
      rate: 1,
      description: '1 ILS = 1 SYNC token',
    },
    paymentProvider: 'green_invoice',
  });
}
