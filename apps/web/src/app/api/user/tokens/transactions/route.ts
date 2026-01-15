import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { getUserById, getUserPayments, getUserEntitlements } from '@/lib/supabase/db';

/**
 * GET /api/user/tokens/transactions
 * Get the current user's token transaction history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(session.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get entitlements which represent token minting events
    const entitlements = await getUserEntitlements(session.userId);

    // Get completed payments for reference
    const payments = await getUserPayments(session.userId);
    const completedPayments = payments.filter((p) => p.status === 'completed');

    // Build transaction history from entitlements (token minting)
    const transactions = entitlements
      .filter((e) => e.type === 'vote' || e.type === 'create_vote')
      .map((entitlement) => {
        // Find related payment if any
        const payment = completedPayments.find(
          (p) => p.id === entitlement.payment_id
        );

        return {
          id: entitlement.id,
          type: 'mint' as const,
          amount: entitlement.type === 'vote' ? 3 : 50, // 3 tokens for voting, 50 for creating
          reason: entitlement.type === 'vote' ? 'vote_participation' : 'vote_creation',
          txHash: payment?.provider_id || '',
          timestamp: new Date(entitlement.granted_at),
        };
      });

    // Sort by timestamp descending (newest first)
    transactions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token transactions' },
      { status: 500 }
    );
  }
}
