import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/services/auth/session';
import { converge } from '@/services/converge';
import type { VerificationSchedule } from '@sync/shared';

/**
 * GET /api/verification/schedule
 * Get full verification schedule (admin/debug endpoint)
 * Requires admin role or returns only user's own schedule
 */
export async function GET(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If requesting another user's schedule, check for admin role
    if (userId && userId !== session.userId) {
      // Check if user is admin
      const user = await converge.getUser(session.userId);
      if (!user || user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }
    }

    // Get the target user's schedule
    const targetUserId = userId || session.userId;

    // Get verification schedule from database
    const schedule = await converge.getVerificationSchedule(targetUserId);

    if (!schedule) {
      return NextResponse.json(
        {
          error: 'No verification schedule found',
          message: 'User has not started verification process'
        },
        { status: 404 }
      );
    }

    // Return full schedule details
    return NextResponse.json({
      schedule: {
        id: schedule.id,
        userId: schedule.userId,
        municipality: schedule.municipality,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        status: schedule.status,
        checkIns: schedule.checkIns.map((checkIn: any) => ({
          id: checkIn.id,
          scheduledDate: checkIn.scheduledDate,
          scheduledTimeStart: checkIn.scheduledTimeStart,
          scheduledTimeEnd: checkIn.scheduledTimeEnd,
          status: checkIn.status,
          completedAt: checkIn.completedAt,
          location: checkIn.location,
          municipalityVerified: checkIn.municipalityVerified,
        })),
        completedCheckIns: schedule.checkIns.filter((c: any) => c.status === 'completed').length,
        totalCheckIns: schedule.checkIns.length,
        missedCheckIns: schedule.checkIns.filter((c: any) => c.status === 'missed').length,
        upcomingCheckIns: schedule.checkIns.filter((c: any) => c.status === 'pending').length,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: session.userId,
        isOwnSchedule: targetUserId === session.userId,
      },
    });
  } catch (error) {
    console.error('Error fetching verification schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/verification/schedule
 * Regenerate verification schedule (admin only)
 * Used for testing or when user needs a fresh schedule
 */
export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await converge.getUser(session.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, municipality, numberOfCheckIns } = body;

    if (!userId || !municipality) {
      return NextResponse.json(
        { error: 'userId and municipality are required' },
        { status: 400 }
      );
    }

    // Import schedule generator
    const { generateVerificationSchedule } = await import('@/services/verification/schedule');

    // Generate new schedule
    const schedule = generateVerificationSchedule(
      userId,
      municipality,
      numberOfCheckIns || undefined
    );

    // Save to database (would replace existing schedule)
    await converge.saveVerificationSchedule(userId, schedule);

    return NextResponse.json({
      success: true,
      message: 'Verification schedule regenerated',
      schedule: {
        id: schedule.id,
        userId: schedule.userId,
        municipality: schedule.municipality,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        totalCheckIns: schedule.checkIns.length,
      },
    });
  } catch (error) {
    console.error('Error regenerating verification schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
