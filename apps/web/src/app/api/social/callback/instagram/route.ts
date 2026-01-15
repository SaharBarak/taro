import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForTokens,
  getInstagramUserInfo,
  getLongLivedToken,
} from '@/services/auth/instagram';
import { getSessionFromRequest } from '@/services/auth/session';
import { convergeService } from '@/services/converge';
import { calculateIdentityScore } from '@sync/shared';
import type { SocialProof } from '@sync/shared';
import { verifyOAuthState, verifyOAuthStatePlatform } from '@/lib/oauth-state';

/**
 * GET /api/social/callback/instagram
 * Handle Instagram OAuth callback
 *
 * Security: Verifies cryptographically signed JWT state to prevent CSRF attacks.
 * Rejects any state that:
 * - Has invalid signature (tampered with)
 * - Is expired (> 10 minutes old)
 * - Has wrong platform
 * - Doesn't match current session user
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle errors from Instagram
  if (error) {
    const errorDescription =
      searchParams.get('error_description') || 'Unknown error';
    return NextResponse.redirect(
      new URL(
        `/settings/social-connections?error=${encodeURIComponent(errorDescription)}`,
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        '/settings/social-connections?error=missing_params',
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }

  try {
    // Verify cryptographically signed state to prevent CSRF attacks
    // This validates: signature, expiration, and decodes userId/platform/nonce
    const stateData = await verifyOAuthState(decodeURIComponent(state));
    if (!stateData) {
      throw new Error('Invalid or expired state - possible CSRF attack');
    }

    // Verify state was created for Instagram (not another platform)
    if (!verifyOAuthStatePlatform(stateData, 'instagram')) {
      throw new Error('State platform mismatch');
    }

    const { userId } = stateData;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get long-lived token
    const longLivedTokens = await getLongLivedToken(tokens.access_token);

    // Get Instagram user info
    const instagramUser = await getInstagramUserInfo(
      longLivedTokens.access_token
    );

    // Get current user from session
    const session = await getSessionFromRequest(request);
    if (!session || session.userId !== userId) {
      throw new Error('Session mismatch');
    }

    // Get user profile
    const user = await convergeService.getUserByGoogleId(session.googleId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create Instagram social proof
    const instagramProof: SocialProof = {
      platform: 'instagram',
      providerId: instagramUser.id,
      displayName: instagramUser.username,
      profileUrl: `https://instagram.com/${instagramUser.username}`,
      connectedAt: new Date(),
      stampWeight: 30,
    };

    // Update social proofs (keep existing, add/update Instagram)
    const existingProofs = user.socialProofs || [];
    const updatedProofs = existingProofs.filter(
      (p) => p.platform !== 'instagram'
    );
    updatedProofs.push(instagramProof);

    // Recalculate identity score
    const newIdentityScore = calculateIdentityScore(updatedProofs);

    // Update user
    await convergeService.updateSocialProofs(
      session.googleId,
      updatedProofs,
      newIdentityScore
    );

    // Redirect to success
    return NextResponse.redirect(
      new URL(
        '/settings/social-connections?success=instagram',
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  } catch (error) {
    console.error('Instagram callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/settings/social-connections?error=${encodeURIComponent(
          error instanceof Error ? error.message : 'callback_failed'
        )}`,
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }
}
