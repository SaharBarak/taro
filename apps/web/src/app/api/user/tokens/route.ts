import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { getUserById } from '@/lib/supabase/db';
import { qubikService } from '@/services/qubik';

/**
 * GET /api/user/tokens
 * Get the current user's token balance and wallet information
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

    // Get token balance from blockchain if wallet exists
    let balance = 0;
    if (user.qubik_wallet_address) {
      try {
        balance = await qubikService.getTokenBalance(user.qubik_wallet_address);
      } catch (e) {
        // Qubik might not be configured in dev
        console.warn('Could not fetch token balance from blockchain:', e);
      }
    }

    return NextResponse.json({
      balance,
      walletAddress: user.qubik_wallet_address || '',
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token balance' },
      { status: 500 }
    );
  }
}
