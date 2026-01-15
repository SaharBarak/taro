import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { getVoteById, getUserById } from '@/lib/supabase/db';
import {
  verifyLocationInMunicipality,
  findMunicipalityByCoordinates,
} from '@/services/verification/municipality';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/votes/[id]/verify-location
 * Verify if the user's GPS coordinates are within the vote's municipality
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const { latitude, longitude } = body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Get the vote to find its municipality
    const vote = await getVoteById(voteId);

    if (!vote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    // If vote has a municipality, verify against it
    if (vote.municipality_id) {
      const result = verifyLocationInMunicipality(
        latitude,
        longitude,
        vote.municipality_id
      );

      return NextResponse.json({
        verified: result.isInside,
        municipality: result.municipality?.name || null,
        distanceFromCenter: result.distanceFromCenter,
      });
    }

    // If no municipality on vote, try to find which municipality the user is in
    const detectedMunicipality = findMunicipalityByCoordinates(
      latitude,
      longitude
    );

    // Also check if user's profile municipality matches
    const user = await getUserById(session.userId);
    const userMunicipality = user?.municipality_id;

    if (userMunicipality) {
      const result = verifyLocationInMunicipality(
        latitude,
        longitude,
        userMunicipality
      );

      return NextResponse.json({
        verified: result.isInside,
        municipality: result.municipality?.name || null,
        distanceFromCenter: result.distanceFromCenter,
      });
    }

    // No municipality context, just report what was detected
    return NextResponse.json({
      verified: !!detectedMunicipality,
      municipality: detectedMunicipality,
    });
  } catch (error) {
    console.error('Error verifying location:', error);
    return NextResponse.json(
      { error: 'Failed to verify location' },
      { status: 500 }
    );
  }
}
