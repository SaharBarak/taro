/**
 * POST /api/merch/fulfillment-webhook
 *
 * Printful notifies this endpoint as an order progresses. We act on
 * `package_shipped` — record the carrier + tracking and advance the order to
 * `shipped` so the thank-you page can show it. Authenticated by a shared secret
 * on the URL (?token=) or an `x-printful-token` header (set the same value in
 * the Printful dashboard webhook URL). Fails OPEN only when the secret is unset.
 *
 * @see https://developers.printful.com/docs/#tag/Webhook-API
 */

import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  getMerchOrderById,
  getMerchOrderByPodOrderId,
  updateMerchOrder,
} from '@/lib/supabase/db';
import { logger } from '@/lib/logger';

function isAuthentic(request: Request): boolean {
  const secret = process.env.PRINTFUL_WEBHOOK_SECRET || '';
  if (!secret) {
    // Fail closed in production; open only in dev.
    if (process.env.NODE_ENV === 'production') {
      logger.error('Printful webhook: PRINTFUL_WEBHOOK_SECRET unset in production — rejecting');
      return false;
    }
    logger.warn('Printful webhook: PRINTFUL_WEBHOOK_SECRET unset — UNAUTHENTICATED (dev only)');
    return true;
  }
  const provided =
    new URL(request.url).searchParams.get('token') ||
    request.headers.get('x-printful-token') ||
    '';
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!isAuthentic(request)) {
    logger.warn('Printful webhook: rejected — bad or missing token');
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let payload: {
    type?: string;
    data?: {
      order?: { id?: number; external_id?: string };
      shipment?: { tracking_number?: string; tracking_url?: string; carrier?: string };
    };
  } = {};
  try {
    payload = await request.json();
  } catch {
    logger.warn('Printful webhook: unparseable body');
    return NextResponse.json({ received: true });
  }

  if (payload.type !== 'package_shipped') {
    // Other event types (order_created, order_failed, …) — ack, no-op for now.
    return NextResponse.json({ received: true });
  }

  const podOrderId = payload.data?.order?.id ? String(payload.data.order.id) : undefined;
  const externalId = payload.data?.order?.external_id;
  const shipment = payload.data?.shipment;

  try {
    // Resolve by POD order id; fall back to our external_id (the merch order id).
    let order = podOrderId ? await getMerchOrderByPodOrderId(podOrderId) : null;
    if (!order && externalId) order = await getMerchOrderById(externalId);

    if (!order) {
      logger.warn('Printful webhook: order not found', { podOrderId, externalId });
      return NextResponse.json({ received: true });
    }

    await updateMerchOrder(order.id, {
      status: 'shipped',
      tracking_number: shipment?.tracking_number ?? null,
      tracking_url: shipment?.tracking_url ?? null,
      carrier: shipment?.carrier ?? null,
    });
    logger.info('Merch order shipped', { orderId: order.id, carrier: shipment?.carrier });
  } catch (error) {
    logger.error('Printful webhook processing failed', {
      error: String(error),
      podOrderId,
    });
  }

  return NextResponse.json({ received: true });
}
