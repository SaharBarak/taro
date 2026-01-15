import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import {
  getActiveVotes,
  getVotesByMunicipality,
  createVote,
  createVoteOptions,
} from '@/lib/supabase/db';

/**
 * GET /api/votes
 * Get votes, optionally filtered by municipality and status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const municipality = searchParams.get('municipality');
    const statusParam = searchParams.get('status');
    // Map 'cancelled' to 'ended' for backwards compatibility (DB only has pending/active/ended)
    const status = statusParam === 'cancelled'
      ? 'ended'
      : (statusParam as 'pending' | 'active' | 'ended' | null);

    let votes;

    if (municipality && status) {
      votes = await getVotesByMunicipality(municipality, status);
    } else if (municipality) {
      votes = await getVotesByMunicipality(municipality);
    } else if (status === 'active') {
      votes = await getActiveVotes();
    } else {
      votes = await getActiveVotes();
    }

    // Transform to API response format
    const transformedVotes = votes.map((vote) => ({
      id: vote.id,
      title: vote.title,
      description: vote.description,
      municipality: vote.municipality_id,
      creatorId: vote.creator_id,
      status: vote.status,
      startDate: vote.start_date,
      endDate: vote.end_date,
      participantCount: vote.participant_count,
      createdAt: vote.created_at,
      updatedAt: vote.updated_at,
    }));

    return NextResponse.json({ votes: transformedVotes });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/votes
 * Create a new vote (requires authentication and payment)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      municipality,
      options,
      startDate,
      endDate,
      paymentTxId,
    } = body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !municipality ||
      !options ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate payment (in production, verify with Green Invoice)
    if (!paymentTxId) {
      return NextResponse.json(
        { error: 'Payment required to create a vote' },
        { status: 402 }
      );
    }

    // Create the vote in Supabase
    const vote = await createVote({
      title,
      description,
      municipality_id: municipality,
      creator_id: session.userId,
      status: new Date(startDate) <= new Date() ? 'active' : 'pending',
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      participant_count: 0,
    });

    // Create vote options separately in Supabase
    // Note: vote_options table only has text/votes, no description field
    const createdOptions = await createVoteOptions(
      options.map((opt: { label: string; description?: string }) => ({
        vote_id: vote.id,
        text: opt.label,
        votes: 0,
      }))
    );

    // Transform to API response format
    // Note: option descriptions are not stored in DB, include from input if provided
    const responseVote = {
      id: vote.id,
      title: vote.title,
      description: vote.description,
      municipality: vote.municipality_id,
      creatorId: vote.creator_id,
      status: vote.status,
      startDate: vote.start_date,
      endDate: vote.end_date,
      participantCount: vote.participant_count,
      options: createdOptions.map((opt, index) => ({
        id: opt.id,
        label: opt.text,
        description: options[index]?.description, // Use input description
        voteCount: opt.votes,
      })),
      createdAt: vote.created_at,
      updatedAt: vote.updated_at,
    };

    return NextResponse.json({ vote: responseVote }, { status: 201 });
  } catch (error) {
    console.error('Error creating vote:', error);
    return NextResponse.json(
      { error: 'Failed to create vote' },
      { status: 500 }
    );
  }
}
