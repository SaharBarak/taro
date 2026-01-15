import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForTokens,
  getInstagramUserInfo,
  getLongLivedToken,
} from '@/services/auth/instagram';
import { getSessionFromRequest } from '@/services/auth/session';
import { calculateIdentityScore } from '@sync/shared';
import type { SocialProof } from '@sync/shared';
import { verifyOAuthState, verifyOAuthStatePlatform } from '@/lib/oauth-state';
import {
  getUserByGoogleId,
  getSocialProofsByUserId,
  upsertSocialProof,
  updateUser,
} from '@/lib/supabase/db';

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

    // Get user profile from Supabase
    const user = await getUserByGoogleId(session.googleId);
    if (!user) {
      throw new Error('User not found');
    }

    // Upsert Instagram social proof in Supabase
    await upsertSocialProof({
      user_id: user.id,
      provider: 'instagram',
      provider_id: instagramUser.id,
      provider_name: instagramUser.username,
      provider_email: null,
      provider_avatar: null,
      connected_at: new Date().toISOString(),
    });

    // Get all social proofs to calculate identity score
    const dbProofs = await getSocialProofsByUserId(user.id);

    // Convert to SocialProof format for identity score calculation
    const socialProofs: SocialProof[] = dbProofs.map((p) => ({
      platform: p.provider as 'google' | 'facebook' | 'instagram',
      providerId: p.provider_id,
      displayName: p.provider_name || p.provider_id, // Fallback to ID if no name
      email: p.provider_email || undefined,
      profileUrl: `https://${p.provider}.com/${p.provider_id}`,
      connectedAt: new Date(p.connected_at),
      stampWeight: p.provider === 'google' ? 40 : 30,
    }));

    // Recalculate identity score
    const newIdentityScore = calculateIdentityScore(socialProofs);

    // Update user identity score
    await updateUser(user.id, {
      identity_score: newIdentityScore.total,
    });

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
