/**
 * GET /api/user/phone/status
 *
 * Get the current phone verification status for the authenticated user.
 * Returns whether the phone is verified and the verification timestamp.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { getUserByGoogleId } from '@/lib/supabase/db';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database with phone verification fields
    const user = await getUserByGoogleId(session.googleId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return phone verification status
    // Note: phone_verified and phone_verified_at fields are from the migration
    const phoneVerified = (user as unknown as { phone_verified?: boolean }).phone_verified || false;
    const phoneVerifiedAt = (user as unknown as { phone_verified_at?: string }).phone_verified_at || null;

    return NextResponse.json({
      verified: phoneVerified,
      phone: phoneVerified ? user.phone : null,
      verifiedAt: phoneVerifiedAt,
    });
  } catch (error: unknown) {
    console.error('Error in phone status endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
