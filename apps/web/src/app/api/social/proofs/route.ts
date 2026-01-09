import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { convergeService } from '@/services/converge';
import { calculateIdentityScore } from '@sync/shared';

/**
 * GET /api/social/proofs
 * Get user's social proofs and identity score
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await convergeService.getUserByGoogleId(session.googleId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      socialProofs: user.socialProofs || [],
      identityScore: user.identityScore || {
        total: 0,
        breakdown: { google: 0, facebook: 0, instagram: 0 },
        level: 'basic',
        lastCalculated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching social proofs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social proofs' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social/proofs
 * Disconnect a social platform
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    if (!platform || !['facebook', 'instagram'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be facebook or instagram.' },
        { status: 400 }
      );
    }

    // Cannot disconnect Google (required)
    if (platform === 'google') {
      return NextResponse.json(
        { error: 'Cannot disconnect Google. It is required for authentication.' },
        { status: 400 }
      );
    }

    const user = await convergeService.getUserByGoogleId(session.googleId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove the platform from social proofs
    const updatedProofs = (user.socialProofs || []).filter(
      (p) => p.platform !== platform
    );

    // Recalculate identity score
    const newIdentityScore = calculateIdentityScore(updatedProofs);

    // Update user
    await convergeService.updateSocialProofs(
      session.googleId,
      updatedProofs,
      newIdentityScore
    );

    return NextResponse.json({
      success: true,
      socialProofs: updatedProofs,
      identityScore: newIdentityScore,
    });
  } catch (error) {
    console.error('Error disconnecting social platform:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect platform' },
      { status: 500 }
    );
  }
}
