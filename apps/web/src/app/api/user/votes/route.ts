import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { getUserVotes } from '@/lib/supabase/db';

/**
 * GET /api/user/votes
 * Get the current user's voting history (simplified format for dashboard)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userVotes = await getUserVotes(session.userId);

    // Transform to the format expected by api-client
    const history = userVotes.map((vote) => ({
      voteId: vote.vote_id,
      optionId: vote.option_id,
      createdAt: vote.created_at,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching voting history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voting history' },
      { status: 500 }
    );
  }
}
