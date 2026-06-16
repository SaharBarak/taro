import { NextRequest, NextResponse } from 'next/server';
import { processVoteResolutions } from '@/services/nft';
import { cronLogger as log } from '@/lib/logger';
import { secureEqual } from '@/lib/secureCompare';

// Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * POST /api/cron/resolve-votes
 *
 * Cron job endpoint that runs periodically to:
 * 1. Find votes that have ended but not resolved
 * 2. Freeze their Issue Coins (stop trading)
 * 3. Create NFT records for all participants
 * 4. Prepare for NFT minting
 *
 * This should be called by a cron service (e.g., Vercel Cron)
 * every 5 minutes.
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify cron secret (required in production)
    const authHeader = request.headers.get('authorization');

    // CRON_SECRET must be configured - reject if not set
    if (!CRON_SECRET) {
      log.error('CRON_SECRET not configured - rejecting request');
      return NextResponse.json(
        { error: 'Cron endpoint not configured' },
        { status: 503 }
      );
    }

    // Verify authorization header matches expected Bearer token
    if (!authHeader || !secureEqual(authHeader, `Bearer ${CRON_SECRET}`)) {
      log.warn('Invalid cron authorization attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();

    // Process all votes that need resolution
    const results = await processVoteResolutions();

    log.info('Vote resolution cron completed', {
      resolved: results.resolved,
      votes: results.votes.map((v) => v.voteId),
      errors: results.errors.length,
    });

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results: {
        resolved: results.resolved,
        votes: results.votes.map((v) => ({
          id: v.voteId,
          title: v.title,
          nftsMinted: v.nftsMinted,
          bagSeeded: v.bagSeeded,
          bagTokenMint: v.bagTokenMint,
        })),
        errors: results.errors,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Cron job error', { error });
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/resolve-votes
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'resolve-votes',
    description: 'Resolves ended votes, freezes Issue Coins, and creates NFT records',
  });
}
