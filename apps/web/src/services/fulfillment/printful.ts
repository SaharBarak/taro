/**
 * Printful print-on-demand fulfilment.
 *
 * Once a merch order is paid, it's handed to Printful for production + shipping.
 * Cart lines map to Printful sync-variant ids via the catalogue's `podVariantId`
 * (populate those from the Printful dashboard). Orders are submitted confirmed
 * (`?confirm=1`) so they go straight to fulfilment. Configured via
 * PRINTFUL_API_KEY; unconfigured → caller leaves the order `paid` (no handoff).
 *
 * @see https://developers.printful.com/docs/
 */

import type { CartItem, ShippingAddress } from '@sync/shared';
import { getPodVariantId } from '@/lib/merch/catalog';

const BASE_URL = 'https://api.printful.com';

/** True when a Printful API key is configured. */
export function isPrintfulConfigured(): boolean {
  return Boolean(process.env.PRINTFUL_API_KEY);
}

/**
 * Create + confirm a Printful order for a paid merch order.
 * @returns the Printful order id.
 * @throws if unconfigured, a line has no mapped variant, or the API fails.
 */
export async function createPrintfulOrder(params: {
  externalId: string;
  items: CartItem[];
  shipping: ShippingAddress;
}): Promise<{ id: string }> {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) throw new Error('Printful is not configured');

  const items = params.items.map((line) => {
    const podVariantId = getPodVariantId(line.productId, line.variantId);
    if (!podVariantId) {
      throw new Error(`No Printful variant mapped for ${line.productId}/${line.variantId}`);
    }
    return { sync_variant_id: Number(podVariantId), quantity: line.quantity };
  });

  const recipient = {
    name: params.shipping.fullName,
    address1: params.shipping.street,
    city: params.shipping.city,
    zip: params.shipping.zip,
    country_code: params.shipping.country || 'IL',
    phone: params.shipping.phone,
    email: params.shipping.email,
  };

  const res = await fetch(`${BASE_URL}/orders?confirm=1`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ external_id: params.externalId, recipient, items }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Printful order failed ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as { result?: { id?: number } };
  if (!data.result?.id) throw new Error('Printful returned no order id');
  return { id: String(data.result.id) };
}
