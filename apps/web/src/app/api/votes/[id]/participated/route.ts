import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { hasUserParticipated } from '@/lib/supabase/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/votes/[id]/participated
 * Check if the current user has participated in a specific vote
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: voteId } = await params;

    if (!voteId) {
      return NextResponse.json(
        { error: 'Vote ID is required' },
        { status: 400 }
      );
    }

    const participated = await hasUserParticipated(session.userId, voteId);

    return NextResponse.json({ participated });
  } catch (error) {
    console.error('Error checking participation:', error);
    return NextResponse.json(
      { error: 'Failed to check participation status' },
      { status: 500 }
    );
  }
}
