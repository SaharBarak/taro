import { NextRequest, NextResponse } from 'next/server';
import { converge } from '@/services/converge';
import {
  sendCheckInReminder,
  sendUpcomingCheckInReminder,
  sendMissedCheckInNotification,
  sendVerificationCompleteNotification,
  sendVerificationFailedNotification,
} from '@/services/notifications/expo';

// Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * POST /api/cron/verification-notifications
 *
 * Cron job endpoint that runs periodically to:
 * 1. Send check-in reminders to users with upcoming check-ins
 * 2. Mark missed check-ins
 * 3. Complete/fail verifications after 21 days
 *
 * This should be called by a cron service (e.g., Vercel Cron, Railway Cron)
 * every 15 minutes.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const results = {
      remindersSet: 0,
      upcomingReminders: 0,
      missedCheckIns: 0,
      completedVerifications: 0,
      failedVerifications: 0,
      errors: [] as string[],
    };

    // Get all active verifications
    const activeVerifications = await converge.getActiveVerifications();

    for (const verification of activeVerifications) {
      try {
        const user = await converge.getUser(verification.userId);
        if (!user || !user.pushToken) {
          continue;
        }

        // Check for check-ins that need reminders (within the next 15 minutes)
        for (const checkIn of verification.checkIns) {
          if (checkIn.status !== 'pending') continue;

          const scheduledStart = new Date(checkIn.scheduledDate);
          scheduledStart.setHours(
            parseInt(checkIn.scheduledTimeStart.split(':')[0]),
            parseInt(checkIn.scheduledTimeStart.split(':')[1])
          );

          const scheduledEnd = new Date(checkIn.scheduledDate);
          scheduledEnd.setHours(
            parseInt(checkIn.scheduledTimeEnd.split(':')[0]),
            parseInt(checkIn.scheduledTimeEnd.split(':')[1])
          );

          const timeDiff = scheduledStart.getTime() - now.getTime();
          const minutesUntilStart = timeDiff / (1000 * 60);

          // Send upcoming reminder (1 hour before)
          if (minutesUntilStart > 45 && minutesUntilStart <= 60) {
            await sendUpcomingCheckInReminder(user.pushToken, {
              scheduledTime: checkIn.scheduledTimeStart,
              municipality: verification.municipality,
            });
            results.upcomingReminders++;
          }

          // Send check-in reminder (at scheduled time)
          if (minutesUntilStart <= 0 && minutesUntilStart > -15) {
            await sendCheckInReminder(user.pushToken, {
              scheduledTime: checkIn.scheduledTimeStart,
              municipality: verification.municipality,
              checkInNumber: verification.checkIns.indexOf(checkIn) + 1,
              totalCheckIns: verification.checkIns.length,
            });
            results.remindersSet++;
          }

          // Mark as missed if window has passed
          if (now > scheduledEnd) {
            await converge.markCheckInMissed(verification.id, checkIn.id);

            const missedCount = verification.checkIns.filter(
              (c: any) => c.status === 'missed'
            ).length + 1;
            const maxMissed = Math.floor(verification.checkIns.length * 0.3); // 30% max missed

            await sendMissedCheckInNotification(user.pushToken, {
              missedCount,
              remainingAttempts: maxMissed - missedCount,
              municipality: verification.municipality,
            });
            results.missedCheckIns++;
          }
        }

        // Check if verification period has ended
        const endDate = new Date(verification.endDate);
        if (now > endDate && verification.status === 'active') {
          const completedCount = verification.checkIns.filter(
            (c: any) => c.status === 'completed'
          ).length;
          const totalCount = verification.checkIns.length;
          const successRate = completedCount / totalCount;

          // Need at least 70% completion rate
          if (successRate >= 0.7) {
            await converge.completeVerification(verification.id);
            await sendVerificationCompleteNotification(user.pushToken, {
              municipality: verification.municipality,
              totalCheckIns: completedCount,
            });
            results.completedVerifications++;
          } else {
            await converge.failVerification(verification.id, 'Too many missed check-ins');
            await sendVerificationFailedNotification(user.pushToken, {
              reason: 'יותר מדי צ׳ק-אינים הוחמצו',
              canRetry: true,
            });
            results.failedVerifications++;
          }
        }
      } catch (error: any) {
        results.errors.push(`Error processing verification ${verification.id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/verification-notifications
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'verification-notifications',
    description: 'Sends push notifications for verification check-ins',
  });
}
