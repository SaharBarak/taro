import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { getUserByGoogleId } from '@/lib/supabase/db';
import { findMunicipalityByCoordinates, verifyLocationInMunicipality, getMunicipalityBounds } from '@/services/verification/municipality';

/**
 * POST /api/user/verify-location
 * Verify user's current location against their registered municipality
 * Used to check if user is within their municipality bounds
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { latitude, longitude } = body;

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of range' },
        { status: 400 }
      );
    }

    // Get user's registered municipality
    const user = await getUserByGoogleId(session.googleId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user has a registered municipality, verify against it
    if (user.municipality_id) {
      const result = verifyLocationInMunicipality(latitude, longitude, user.municipality_id);
      const municipalityBounds = getMunicipalityBounds(user.municipality_id);

      return NextResponse.json({
        verified: result.isInside,
        municipality: result.isInside ? municipalityBounds?.nameHe : undefined,
        municipalityId: result.isInside ? user.municipality_id : undefined,
        distanceFromCenter: result.distanceFromCenter,
      });
    }

    // If no registered municipality, detect which municipality user is in
    const detectedMunicipality = findMunicipalityByCoordinates(latitude, longitude);

    if (detectedMunicipality) {
      const municipalityBounds = getMunicipalityBounds(detectedMunicipality);

      return NextResponse.json({
        verified: true,
        municipality: municipalityBounds?.nameHe,
        municipalityId: detectedMunicipality,
      });
    }

    // Location not in any known municipality
    return NextResponse.json({
      verified: false,
      municipality: undefined,
    });
  } catch (error) {
    console.error('Error verifying location:', error);
    return NextResponse.json(
      { error: 'Failed to verify location' },
      { status: 500 }
    );
  }
}
