/**
 * Printful shipment webhook tests — POST /api/merch/fulfillment-webhook.
 * Auth via shared secret; package_shipped advances the order to shipped + stores
 * tracking; other event types and unknown orders are acked as no-ops.
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';

vi.mock('@/lib/supabase/db', () => ({
  getMerchOrderById: vi.fn(),
  getMerchOrderByPodOrderId: vi.fn(),
  updateMerchOrder: vi.fn(),
}));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { getMerchOrderById, getMerchOrderByPodOrderId, updateMerchOrder } from '@/lib/supabase/db';

const SECRET = 'pf-hook-secret';
const ORDER = { id: 'order-1', status: 'fulfilling' };

function shippedPayload() {
  return {
    type: 'package_shipped',
    data: {
      order: { id: 555, external_id: 'order-1' },
      shipment: { tracking_number: 'TRK1', tracking_url: 'https://t/TRK1', carrier: 'IPS' },
    },
  };
}

function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('POST /api/merch/fulfillment-webhook', () => {
  let POST: typeof import('@/app/api/merch/fulfillment-webhook/route').POST;
  const ORIGINAL = process.env.PRINTFUL_WEBHOOK_SECRET;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.PRINTFUL_WEBHOOK_SECRET = SECRET;
    (getMerchOrderByPodOrderId as Mock).mockResolvedValue(ORDER);
    (updateMerchOrder as Mock).mockResolvedValue(ORDER);
    POST = (await import('@/app/api/merch/fulfillment-webhook/route')).POST;
  });
  afterEach(() => {
    process.env.PRINTFUL_WEBHOOK_SECRET = ORIGINAL;
  });

  it('rejects a bad token (401)', async () => {
    const res = await POST(post('http://localhost/api/merch/fulfillment-webhook?token=nope', shippedPayload()));
    expect(res.status).toBe(401);
    expect(updateMerchOrder).not.toHaveBeenCalled();
  });

  it('marks shipped + stores tracking on package_shipped', async () => {
    const res = await POST(post(`http://localhost/api/merch/fulfillment-webhook?token=${SECRET}`, shippedPayload()));
    expect(res.status).toBe(200);
    expect(updateMerchOrder).toHaveBeenCalledWith('order-1', {
      status: 'shipped',
      tracking_number: 'TRK1',
      tracking_url: 'https://t/TRK1',
      carrier: 'IPS',
    });
  });

  it('accepts the secret via header', async () => {
    const res = await POST(post('http://localhost/api/merch/fulfillment-webhook', shippedPayload(), { 'x-printful-token': SECRET }));
    expect(res.status).toBe(200);
  });

  it('no-ops on non-shipped event types', async () => {
    const res = await POST(post(`http://localhost/api/merch/fulfillment-webhook?token=${SECRET}`, { type: 'order_created', data: {} }));
    expect(res.status).toBe(200);
    expect(updateMerchOrder).not.toHaveBeenCalled();
  });

  it('falls back to external_id when POD id lookup misses', async () => {
    (getMerchOrderByPodOrderId as Mock).mockResolvedValue(null);
    (getMerchOrderById as Mock).mockResolvedValue(ORDER);
    const res = await POST(post(`http://localhost/api/merch/fulfillment-webhook?token=${SECRET}`, shippedPayload()));
    expect(res.status).toBe(200);
    expect(getMerchOrderById).toHaveBeenCalledWith('order-1');
    expect(updateMerchOrder).toHaveBeenCalled();
  });

  it('acks 200 when the order is unknown', async () => {
    (getMerchOrderByPodOrderId as Mock).mockResolvedValue(null);
    (getMerchOrderById as Mock).mockResolvedValue(null);
    const res = await POST(post(`http://localhost/api/merch/fulfillment-webhook?token=${SECRET}`, shippedPayload()));
    expect(res.status).toBe(200);
    expect(updateMerchOrder).not.toHaveBeenCalled();
  });
});
