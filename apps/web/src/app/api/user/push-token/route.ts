import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/services/auth/session';
import {
  upsertPushToken,
  getPushTokensByUserId,
  deletePushToken,
  deactivatePushToken,
} from '@/lib/supabase/db';

/**
 * Validates Expo push token format
 * Expo tokens look like: ExponentPushToken[xxx]
 */
function isValidExpoPushToken(token: string): boolean {
  return /^ExponentPushToken\[.+\]$/.test(token);
}

interface PushTokenRequest {
  token: string;
  deviceType: 'ios' | 'android';
  deviceName?: string;
}

/**
 * POST /api/user/push-token
 * Register or update a push notification token
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: PushTokenRequest = await request.json();
    const { token, deviceType, deviceName } = body;

    if (!token || !deviceType) {
      return NextResponse.json(
        { error: 'Token and deviceType are required' },
        { status: 400 }
      );
    }

    if (!isValidExpoPushToken(token)) {
      return NextResponse.json(
        { error: 'Invalid Expo push token format' },
        { status: 400 }
      );
    }

    if (!['ios', 'android'].includes(deviceType)) {
      return NextResponse.json(
        { error: 'deviceType must be ios or android' },
        { status: 400 }
      );
    }

    const pushToken = await upsertPushToken({
      user_id: session.userId,
      token,
      device_type: deviceType,
      device_name: deviceName || null,
      is_active: true,
      last_used: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      tokenId: pushToken.id,
    });
  } catch (error) {
    console.error('Push token registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register push token' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/push-token
 * Get all push tokens for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokens = await getPushTokensByUserId(session.userId);

    return NextResponse.json({
      tokens: tokens.map((t) => ({
        id: t.id,
        token: t.token,
        deviceType: t.device_type,
        deviceName: t.device_name,
        isActive: t.is_active,
        lastUsed: t.last_used,
        createdAt: t.created_at,
      })),
    });
  } catch (error) {
    console.error('Get push tokens error:', error);
    return NextResponse.json(
      { error: 'Failed to get push tokens' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/push-token
 * Remove a push token (e.g., on logout or app uninstall)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action') || 'delete';

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required as a query parameter' },
        { status: 400 }
      );
    }

    if (action === 'deactivate') {
      await deactivatePushToken(session.userId, token);
    } else {
      await deletePushToken(session.userId, token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push token deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete push token' },
      { status: 500 }
    );
  }
}
