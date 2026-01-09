/**
 * Session API Route
 *
 * POST: Validate session and get current user
 * DELETE: Sign out and clear session
 */

import { NextResponse } from 'next/server';
import {
  getSessionFromRequest,
  clearSessionCookies,
} from '@/services/auth/session';
import type { UserProfile } from '@sync/shared';

// Mock database function - replace with actual Converge implementation
async function getUserById(userId: string): Promise<UserProfile | null> {
  // TODO: Replace with convergeService.getUserById(userId)
  return null;
}

/**
 * POST /api/auth/session
 * Validate session and return current user
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session', code: 'INVALID_SESSION' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserById(session.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      user,
      session: {
        userId: session.userId,
        did: session.did,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Session validation failed', code: 'VALIDATION_FAILED' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Sign out - clear session cookies
 */
export async function DELETE() {
  try {
    await clearSessionCookies();

    return NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Sign out failed', code: 'SIGNOUT_FAILED' },
      { status: 500 }
    );
  }
}
