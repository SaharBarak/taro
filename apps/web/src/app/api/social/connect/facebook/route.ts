import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { buildFacebookAuthUrl } from '@/services/auth/facebook';

/**
 * GET /api/social/connect/facebook
 * Initiate Facebook OAuth flow for social proof
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

    // Build and redirect to Facebook OAuth URL
    const authUrl = buildFacebookAuthUrl(encodeURIComponent(state));
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Facebook connect initiation error:', error);
    return NextResponse.redirect(
      new URL(
        '/settings/social-connections?error=connect_failed',
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }
}
