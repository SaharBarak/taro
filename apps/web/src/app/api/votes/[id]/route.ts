import { NextRequest, NextResponse } from 'next/server';
import { getVoteWithOptions } from '@/lib/supabase/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/votes/[id]
 * Get a specific vote by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const voteData = await getVoteWithOptions(id);

    if (!voteData) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
      );
    }

    // Transform to API response format
    const vote = {
      id: voteData.id,
      title: voteData.title,
      description: voteData.description,
      municipality: voteData.municipality_id,
      creatorId: voteData.creator_id,
      status: voteData.status,
      startDate: voteData.start_date,
      endDate: voteData.end_date,
      participantCount: voteData.participant_count,
      // Note: vote_options table doesn't have description field
      options: voteData.options.map((opt) => ({
        id: opt.id,
        label: opt.text,
        voteCount: opt.votes,
      })),
      createdAt: voteData.created_at,
      updatedAt: voteData.updated_at,
    };

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote' },
      { status: 500 }
    );
  }
}
