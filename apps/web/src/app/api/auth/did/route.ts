/**
 * DID API Routes
 *
 * POST /api/auth/did/generate - Generate new DID for user
 * POST /api/auth/did/recover - Recover DID using OAuth token
 */

import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import {
  generateEncryptedDID,
  recoverPrivateKey,
  verifyDID,
} from '@sync/shared';

// Mock database functions - replace with actual Converge implementation
async function getDIDRecord(userId: string): Promise<{
  did: string;
  publicKey: string;
  encryptedPrivateKeyBackup: string;
  salt: string;
  iv: string;
} | null> {
  // TODO: Replace with convergeService.getDIDRecord(userId)
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

async function updateUserDID(
  userId: string,
  did: string,
  publicKey: string
): Promise<void> {
  // TODO: Replace with convergeService.updateUserDID(userId, did, publicKey)
}

/**
 * POST /api/auth/did
 * Generate new DID or recover existing
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, oauthToken } = body;

    if (!oauthToken) {
      return NextResponse.json(
        { error: 'OAuth token required for DID operations', code: 'MISSING_TOKEN' },
        { status: 400 }
      );
    }

    if (action === 'generate') {
      // Generate new DID
      const didData = await generateEncryptedDID(oauthToken);

      // Save DID record for recovery
      await saveDIDRecord({
        did: didData.did,
        userId: session.userId,
        publicKey: JSON.stringify(didData.publicKey),
        encryptedPrivateKeyBackup: didData.encryptedPrivateKey,
        salt: didData.salt,
        iv: didData.iv,
      });

      // Update user with DID
      await updateUserDID(
        session.userId,
        didData.did,
        JSON.stringify(didData.publicKey)
      );

      return NextResponse.json({
        success: true,
        did: didData.did,
        publicKey: didData.publicKey,
        // Note: We don't return the encrypted private key - it stays on server
        // Client should store the unencrypted key locally
      });
    } else if (action === 'recover') {
      // Recover DID using OAuth token
      const didRecord = await getDIDRecord(session.userId);

      if (!didRecord) {
        return NextResponse.json(
          { error: 'No DID found for recovery', code: 'DID_NOT_FOUND' },
          { status: 404 }
        );
      }

      try {
        // Attempt to decrypt private key with OAuth token
        const privateKey = await recoverPrivateKey(
          oauthToken,
          didRecord.encryptedPrivateKeyBackup,
          didRecord.salt,
          didRecord.iv
        );

        // Verify the recovered key matches the stored public key
        const publicKey = JSON.parse(didRecord.publicKey);
        const isValid = await verifyDID(didRecord.did, publicKey);

        if (!isValid) {
          return NextResponse.json(
            { error: 'DID verification failed', code: 'DID_INVALID' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          did: didRecord.did,
          publicKey,
          privateKey, // Return for client to store locally
          message: 'DID recovered successfully',
        });
      } catch {
        return NextResponse.json(
          {
            error: 'Recovery failed - token may have changed',
            code: 'RECOVERY_FAILED',
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "generate" or "recover"', code: 'INVALID_ACTION' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('DID operation error:', error);
    return NextResponse.json(
      {
        error: 'DID operation failed',
        code: 'DID_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
