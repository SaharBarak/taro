/**
 * Printful fulfilment service tests — builds + confirms an order from a paid
 * merch order. The catalog variant mapping + fetch are mocked.
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import type { CartItem, ShippingAddress } from '@sync/shared';

vi.mock('@/lib/merch/catalog', () => ({ getPodVariantId: vi.fn(() => '4012') }));
import { getPodVariantId } from '@/lib/merch/catalog';

const ITEMS: CartItem[] = [
  { productId: 'tee-press', slug: 'press-tee', name: 'Tee', variantId: 'm', variantLabel: 'M', unitPriceILS: 89, quantity: 2, image: '/x.png' },
];
const SHIPPING: ShippingAddress = {
  fullName: 'דנה כהן', phone: '+972500000000', email: 'd@example.com',
  street: 'הרצל 1', city: 'קריית טבעון', zip: '3600000', country: 'IL',
};

describe('Printful fulfilment service', () => {
  const ORIGINAL = { ...process.env };
  let captured: { url: string; body: string; auth: string } | null;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    (getPodVariantId as Mock).mockReturnValue('4012');
    process.env.PRINTFUL_API_KEY = 'pf-key';
    captured = null;
    vi.stubGlobal('fetch', vi.fn(async (url: string, init: { body: string; headers: Record<string, string> }) => {
      captured = { url, body: init.body, auth: init.headers.authorization };
      return { ok: true, json: async () => ({ result: { id: 777 } }) } as unknown as Response;
    }));
  });
  afterEach(() => {
    process.env = { ...ORIGINAL };
    vi.unstubAllGlobals();
  });

  it('reports configured only with an API key', async () => {
    const { isPrintfulConfigured } = await import('@/services/fulfillment/printful');
    expect(isPrintfulConfigured()).toBe(true);
    delete process.env.PRINTFUL_API_KEY;
    vi.resetModules();
    expect((await import('@/services/fulfillment/printful')).isPrintfulConfigured()).toBe(false);
  });

  it('creates a confirmed order with mapped variants + recipient', async () => {
    const { createPrintfulOrder } = await import('@/services/fulfillment/printful');
    const res = await createPrintfulOrder({ externalId: 'order-1', items: ITEMS, shipping: SHIPPING });
    expect(res.id).toBe('777');
    expect(captured!.url).toContain('/orders?confirm=1');
    expect(captured!.auth).toBe('Bearer pf-key');
    const body = JSON.parse(captured!.body);
    expect(body.external_id).toBe('order-1');
    expect(body.items).toEqual([{ sync_variant_id: 4012, quantity: 2 }]);
    expect(body.recipient).toMatchObject({ country_code: 'IL', name: 'דנה כהן', zip: '3600000' });
  });

  it('throws when unconfigured', async () => {
    delete process.env.PRINTFUL_API_KEY;
    vi.resetModules();
    const { createPrintfulOrder } = await import('@/services/fulfillment/printful');
    await expect(createPrintfulOrder({ externalId: 'o', items: ITEMS, shipping: SHIPPING })).rejects.toThrow(/not configured/);
  });

  it('throws when a line has no mapped Printful variant', async () => {
    (getPodVariantId as Mock).mockReturnValue(null);
    const { createPrintfulOrder } = await import('@/services/fulfillment/printful');
    await expect(createPrintfulOrder({ externalId: 'o', items: ITEMS, shipping: SHIPPING })).rejects.toThrow(/No Printful variant/);
  });

  it('throws on a non-OK Printful response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 422, text: async () => 'bad' }) as unknown as Response));
    const { createPrintfulOrder } = await import('@/services/fulfillment/printful');
    await expect(createPrintfulOrder({ externalId: 'o', items: ITEMS, shipping: SHIPPING })).rejects.toThrow(/Printful order failed 422/);
  });
});
