import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { convergeService } from '@/services/converge';
import { verifyCheckIn } from '@/services/verification/municipality';
import type { VerificationStatus } from '@sync/shared';

interface CheckInRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
  checkInId?: string;
}

/**
 * POST /api/verification/check-in
 * Record a GPS location check-in
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CheckInRequest = await request.json();
    const { latitude, longitude, accuracy, checkInId } = body;

    // Validate required fields
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates provided' },
        { status: 400 }
      );
    }

    const user = await convergeService.getUserByGoogleId(session.googleId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if verification is in progress
    if (user.verificationStatus?.phase !== 'in_progress') {
      return NextResponse.json(
        { error: 'No verification in progress. Please start verification first.' },
        { status: 400 }
      );
    }

    // Check if user has a municipality set
    if (!user.municipality) {
      return NextResponse.json(
        { error: 'No municipality selected' },
        { status: 400 }
      );
    }

    // Verify the GPS location
    const verificationResult = verifyCheckIn(
      latitude,
      longitude,
      accuracy,
      user.municipality
    );

    if (!verificationResult.verified) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: verificationResult.error,
          details: {
            inMunicipality: verificationResult.inMunicipality,
            accuracyAcceptable: verificationResult.accuracyAcceptable,
            distanceFromCenter: verificationResult.distanceFromCenter,
          },
        },
        { status: 400 }
      );
    }

    // Update verification status
    const currentStatus = user.verificationStatus;
    const newCompletedCount = (currentStatus.checkInsCompleted || 0) + 1;

    const updatedStatus: VerificationStatus = {
      ...currentStatus,
      checkInsCompleted: newCompletedCount,
    };

    // Check if all check-ins are complete
    if (
      currentStatus.checkInsTotal &&
      newCompletedCount >= currentStatus.checkInsTotal
    ) {
      updatedStatus.phase = 'completed';
      updatedStatus.completedAt = new Date();
    }

    // Update user's verification status
    await convergeService.updateUser(session.googleId, {
      verificationStatus: updatedStatus,
    });

    // Log the check-in
    // TODO: Store detailed check-in record with timestamp and location
    console.log('Check-in recorded:', {
      userId: user.id,
      checkInId,
      latitude,
      longitude,
      accuracy,
      verified: true,
      municipality: user.municipality,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      verified: true,
      checkIn: {
        id: checkInId || `check-in-${Date.now()}`,
        completedAt: new Date().toISOString(),
        location: { latitude, longitude, accuracy },
        municipalityVerified: true,
        distanceFromCenter: verificationResult.distanceFromCenter,
      },
      verificationStatus: updatedStatus,
      progress: {
        completedCheckIns: newCompletedCount,
        totalCheckIns: currentStatus.checkInsTotal || 0,
        completionRate:
          currentStatus.checkInsTotal
            ? newCompletedCount / currentStatus.checkInsTotal
            : 0,
      },
    });
  } catch (error) {
    console.error('Error processing check-in:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
}
