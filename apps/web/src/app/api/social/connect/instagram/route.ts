import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import { buildInstagramAuthUrl } from '@/services/auth/instagram';
import { createOAuthState } from '@/lib/oauth-state';

/**
 * GET /api/social/connect/instagram
 * Initiate Instagram OAuth flow for social proof
 *
 * Security: Uses cryptographically signed JWT state to prevent CSRF attacks.
 * The state is signed with JWT_SECRET and includes userId, platform, nonce,
 * and a 10-minute expiration to limit replay window.
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

    // Create cryptographically signed state to prevent CSRF attacks
    // State includes: userId, platform, nonce, timestamp, and expiration
    const state = await createOAuthState(session.userId, 'instagram');

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
