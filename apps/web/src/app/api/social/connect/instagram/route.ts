import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { buildInstagramAuthUrl } from '@/services/auth/instagram';

/**
 * GET /api/social/connect/instagram
 * Initiate Instagram OAuth flow for social proof
 */
export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.redirect(
        new URL('/sign-in?error=unauthenticated', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    // Create secure state with user ID for callback verification
    const state = JSON.stringify({
      userId: session.userId,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2),
    });

    // Build and redirect to Instagram OAuth URL
    const authUrl = buildInstagramAuthUrl(encodeURIComponent(state));
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Instagram connect initiation error:', error);
    return NextResponse.redirect(
      new URL(
        '/settings/social-connections?error=connect_failed',
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }
}
