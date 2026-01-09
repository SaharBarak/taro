import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { greenInvoiceService } from '@/services/payments/greenInvoice';

/**
 * GET /api/payments/:id/status
 * Get payment status by Green Invoice payment ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    const status = await greenInvoiceService.getPaymentStatus(id);

    return NextResponse.json({
      id: status.id,
      status: status.status,
      amount: status.amount,
      currency: status.currency,
      receiptUrl: status.receiptUrl || null,
      succeeded: status.status === 'succeeded',
      tokensEarned: status.status === 'succeeded' ? status.amount : 0,
      processedAt: status.processedAt.toISOString(),
      transactionId: status.txHash,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
