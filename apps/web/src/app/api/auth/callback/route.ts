/**
 * Google OAuth Callback API Route
 *
 * Handles the OAuth callback from Google, exchanges code for tokens,
 * creates or updates user, generates DID if new user.
 */

import { NextResponse } from 'next/server';
import {
  exchangeCodeForTokens,
  getGoogleUserInfo,
} from '@/services/auth/google';
import {
  createSessionToken,
  createRefreshToken,
  setSessionCookies,
} from '@/services/auth/session';
import {
  generateEncryptedDID,
  createSocialProof,
  createInitialIdentityScore,
  calculateIdentityScore,
} from '@sync/shared';
import type { UserProfile, VerificationStatus, SocialProof } from '@sync/shared';

// Mock database functions - replace with actual Converge implementation
async function getUserByGoogleId(googleId: string): Promise<UserProfile | null> {
  // TODO: Replace with convergeService.getUserByGoogleId(googleId)
  return null;
}

async function createUser(userData: Partial<UserProfile>): Promise<UserProfile> {
  // TODO: Replace with convergeService.createUser(userData)
  const user: UserProfile = {
    id: `user_${Date.now()}`,
    did: userData.did!,
    publicKey: userData.publicKey!,
    googleId: userData.googleId!,
    email: userData.email!,
    emailVerified: true,
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    municipality: '',
    socialProofs: userData.socialProofs || [],
    identityScore: userData.identityScore || createInitialIdentityScore(),
    verificationStatus: userData.verificationStatus || { phase: 'not_started' },
    qubikWalletAddress: '',
    syncTokenBalance: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return user;
}

async function updateUser(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  // TODO: Replace with convergeService.updateUser(userId, updates)
  return null;
}

async function saveDIDRecord(record: {
  did: string;
  userId: string;
  publicKey: string;
  encryptedPrivateKeyBackup: string;
  salt: string;
  iv: string;
}): Promise<void> {
  // TODO: Replace with convergeService.saveDIDRecord(record)
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code required', code: 'MISSING_CODE' },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientSecret) {
      return NextResponse.json(
        { error: 'Server configuration error', code: 'CONFIG_ERROR' },
        { status: 500 }
      );
    }

    const tokens = await exchangeCodeForTokens(code, redirectUri, clientSecret);

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.accessToken);

    // Check if user exists
    let user = await getUserByGoogleId(googleUser.id);
    let isNewUser = false;

    if (!user) {
      // New user - generate DID
      isNewUser = true;

      const didData = await generateEncryptedDID(tokens.accessToken);

      // Create Google social proof
      const googleProof = createSocialProof(
        'google',
        googleUser.id,
        googleUser.name,
        {
          profileImage: googleUser.picture,
          email: googleUser.email,
        }
      );

      // Calculate initial identity score
      const identityScore = calculateIdentityScore([googleProof]);

      // Initial verification status
      const verificationStatus: VerificationStatus = {
        phase: 'not_started',
      };

      // Create user
      user = await createUser({
        did: didData.did,
        publicKey: JSON.stringify(didData.publicKey),
        googleId: googleUser.id,
        email: googleUser.email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        socialProofs: [googleProof],
        identityScore,
        verificationStatus,
      });

      // Save DID record for key recovery
      await saveDIDRecord({
        did: didData.did,
        userId: user.id,
        publicKey: JSON.stringify(didData.publicKey),
        encryptedPrivateKeyBackup: didData.encryptedPrivateKey,
        salt: didData.salt,
        iv: didData.iv,
      });
    } else {
      // Existing user - update last login
      await updateUser(user.id, {
        updatedAt: new Date(),
      });
    }

    // Create session tokens
    const sessionToken = await createSessionToken({
      userId: user.id,
      googleId: googleUser.id,
      did: user.did,
      email: user.email,
    });

    const refreshToken = await createRefreshToken(user.id);

    // Set session cookies
    await setSessionCookies(sessionToken, refreshToken);

    // Return response
    return NextResponse.json({
      success: true,
      user,
      accessToken: sessionToken,
      refreshToken,
      isNewUser,
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      {
        error: 'Authentication failed',
        code: 'AUTH_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
