import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { convergeService } from '@/services/converge';
import {
  generateVerificationSchedule,
  createVerificationStatus,
} from '@/services/verification/schedule';
import { getMunicipalityBounds } from '@/services/verification/municipality';

/**
 * POST /api/verification/start
 * Start a new 21-day GPS verification period
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await convergeService.getUserByGoogleId(session.googleId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has selected a municipality
    if (!user.municipality) {
      return NextResponse.json(
        { error: 'Please select a municipality before starting verification' },
        { status: 400 }
      );
    }

    // Check if municipality is valid
    const municipalityBounds = getMunicipalityBounds(user.municipality);
    if (!municipalityBounds) {
      return NextResponse.json(
        { error: 'Invalid municipality selected' },
        { status: 400 }
      );
    }

    // Check if verification is already in progress
    if (user.verificationStatus?.phase === 'in_progress') {
      return NextResponse.json(
        { error: 'Verification is already in progress' },
        { status: 400 }
      );
    }

    // Check if user already completed verification
    if (user.verificationStatus?.phase === 'completed') {
      return NextResponse.json(
        { error: 'Verification already completed. No need to verify again.' },
        { status: 400 }
      );
    }

    // Generate verification schedule
    const schedule = generateVerificationSchedule(user.id, user.municipality);

    // Save schedule to database
    // TODO: Implement convergeService.createVerificationSchedule
    // For now, we'll store the schedule ID in the user's verification status

    // Update user's verification status
    const verificationStatus = createVerificationStatus(schedule);

    // Update user with new verification status
    // TODO: Implement convergeService.updateVerificationStatus
    await convergeService.updateUser(session.googleId, {
      verificationStatus,
    });

    return NextResponse.json({
      success: true,
      schedule: {
        id: schedule.id,
        municipality: schedule.municipality,
        periodStart: schedule.periodStart,
        periodEnd: schedule.periodEnd,
        totalCheckIns: schedule.scheduledCheckIns.length,
        // Only send the next check-in time, not the full schedule
        nextCheckIn: schedule.scheduledCheckIns[0]?.scheduledAt,
      },
      verificationStatus,
    });
  } catch (error) {
    console.error('Error starting verification:', error);
    return NextResponse.json(
      { error: 'Failed to start verification' },
      { status: 500 }
    );
  }
}
