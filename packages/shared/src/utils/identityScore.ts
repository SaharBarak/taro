/**
 * Identity Score Calculator
 *
 * Calculates user's identity verification score based on GPS verification and connected social accounts.
 * Higher scores indicate higher confidence in user's authentic identity (Sybil-resistance).
 *
 * Score Breakdown (per specs/auth-flow.md v77):
 * - GPS Verification: 40 points (location proof, highest weight)
 * - Google: 40 points (primary auth, REQUIRED)
 * - Facebook: 10 points (social proof)
 * - Instagram: 10 points (social proof)
 *
 * Levels:
 * - basic: 40-59 points (Google only)
 * - verified: 60-79 points (Google + GPS or Google + both socials)
 * - trusted: 80-100 points (Google + GPS + at least one social)
 *
 * Minimum to vote: 40 points (Google verification required)
 * Recommended: 80+ points (trusted status with GPS verification)
 */

import type { SocialProof, IdentityScore, SocialPlatform } from '../types/user';

// === Score Constants ===

export const GPS_SCORE_WEIGHT = 40;

export const IDENTITY_SCORE_WEIGHTS: Record<SocialPlatform, number> = {
  google: 40,
  facebook: 10,
  instagram: 10,
};

export const MINIMUM_VOTING_SCORE = 40;
export const VERIFIED_THRESHOLD = 60;
export const TRUSTED_THRESHOLD = 80;

// === Score Calculation ===

/**
 * Calculate identity score from social proofs and GPS verification status
 * @param socialProofs - Array of connected social proof objects
 * @param gpsVerified - Whether GPS verification is completed (21-day verification passed)
 */
export function calculateIdentityScore(
  socialProofs: SocialProof[],
  gpsVerified: boolean = false
): IdentityScore {
  const breakdown = {
    gps: gpsVerified ? GPS_SCORE_WEIGHT : 0,
    google: 0,
    facebook: 0,
    instagram: 0,
  };

  // Calculate points for each verified platform
  for (const proof of socialProofs) {
    const weight = IDENTITY_SCORE_WEIGHTS[proof.platform];
    if (weight) {
      breakdown[proof.platform] = weight;
    }
  }

  // Calculate total score
  const total =
    breakdown.gps + breakdown.google + breakdown.facebook + breakdown.instagram;

  // Determine level based on new thresholds (per specs/auth-flow.md v77)
  // basic: 40-59, verified: 60-79, trusted: 80-100
  let level: IdentityScore['level'];
  if (total >= TRUSTED_THRESHOLD) {
    level = 'trusted';
  } else if (total >= VERIFIED_THRESHOLD) {
    level = 'verified';
  } else {
    level = 'basic';
  }

  return {
    total,
    breakdown,
    level,
  };
}

/**
 * Check if user has minimum score to vote
 */
export function canVote(identityScore: IdentityScore): boolean {
  return identityScore.total >= MINIMUM_VOTING_SCORE;
}

/**
 * Check if user has Google verification (required)
 */
export function hasGoogleVerification(socialProofs: SocialProof[]): boolean {
  return socialProofs.some((proof) => proof.platform === 'google');
}

/**
 * Get missing verifications for trusted status
 */
export function getMissingVerifications(
  socialProofs: SocialProof[]
): SocialPlatform[] {
  const verifiedPlatforms = new Set(socialProofs.map((p) => p.platform));
  const allPlatforms: SocialPlatform[] = ['google', 'facebook', 'instagram'];
  return allPlatforms.filter((platform) => !verifiedPlatforms.has(platform));
}

/**
 * Get points needed for next level
 */
export function getPointsToNextLevel(identityScore: IdentityScore): {
  currentLevel: IdentityScore['level'];
  nextLevel: IdentityScore['level'] | null;
  pointsNeeded: number;
} {
  const { total, level } = identityScore;

  if (level === 'trusted') {
    return {
      currentLevel: level,
      nextLevel: null,
      pointsNeeded: 0,
    };
  }

  if (level === 'verified') {
    return {
      currentLevel: level,
      nextLevel: 'trusted',
      pointsNeeded: TRUSTED_THRESHOLD - total,
    };
  }

  // basic level
  return {
    currentLevel: level,
    nextLevel: 'verified',
    pointsNeeded: VERIFIED_THRESHOLD - total,
  };
}

/**
 * Create initial identity score (before any verification)
 */
export function createInitialIdentityScore(): IdentityScore {
  return {
    total: 0,
    breakdown: {
      gps: 0,
      google: 0,
      facebook: 0,
      instagram: 0,
    },
    level: 'basic',
  };
}

/**
 * Create social proof for a newly verified platform
 */
export function createSocialProof(
  platform: SocialPlatform,
  providerId: string,
  displayName: string,
  options?: {
    profileUrl?: string;
    profileImage?: string;
    email?: string;
  }
): SocialProof {
  return {
    platform,
    providerId,
    displayName,
    profileUrl: options?.profileUrl,
    profileImage: options?.profileImage,
    email: options?.email,
    connectedAt: new Date(),
    stampWeight: IDENTITY_SCORE_WEIGHTS[platform],
  };
}

/**
 * Get Hebrew label for identity level
 */
export function getIdentityLevelLabel(level: IdentityScore['level']): string {
  const labels: Record<IdentityScore['level'], string> = {
    basic: 'בסיסי',
    verified: 'מאומת',
    trusted: 'מהימן',
  };
  return labels[level];
}

/**
 * Get Hebrew label for social platform
 */
export function getSocialPlatformLabel(platform: SocialPlatform): string {
  const labels: Record<SocialPlatform, string> = {
    google: 'גוגל',
    facebook: 'פייסבוק',
    instagram: 'אינסטגרם',
  };
  return labels[platform];
}

/**
 * Get description for identity level
 */
export function getIdentityLevelDescription(
  level: IdentityScore['level']
): string {
  const descriptions: Record<IdentityScore['level'], string> = {
    basic: 'אימות Google בלבד - מומלץ להוסיף אימות GPS',
    verified: 'אימות עם GPS או רשתות חברתיות - רמת אמון גבוהה',
    trusted: 'אימות מלא עם GPS - רמת אמון מקסימלית',
  };
  return descriptions[level];
}

/**
 * Check if GPS verification contributes to identity score
 */
export function hasGpsVerification(identityScore: IdentityScore): boolean {
  return identityScore.breakdown.gps > 0;
}

/**
 * Get Hebrew label for verification type (GPS or social platform)
 */
export function getVerificationTypeLabel(
  type: SocialPlatform | 'gps'
): string {
  const labels: Record<SocialPlatform | 'gps', string> = {
    gps: 'אימות מיקום',
    google: 'גוגל',
    facebook: 'פייסבוק',
    instagram: 'אינסטגרם',
  };
  return labels[type];
}
