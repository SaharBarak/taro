/**
 * POST /api/merch/webhook
 *
 * Green Invoice notifies this endpoint after a payment completes (the `custom`
 * field carries our order id). Acknowledge fast (200) and record the outcome.
 *
 * TODO (needs persistence + POD wiring):
 *  - Look up the order by id, mark it `paid`, store the issued document id.
 *  - Hand the order to the POD partner (Printful/Printify) for fulfilment.
 *  - Idempotency on the document/payment id to survive retries.
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  let payload: Record<string, unknown> = {};
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      payload = (await request.json()) as Record<string, unknown>;
    } else {
      const form = await request.formData();
      payload = Object.fromEntries(form.entries());
    }
  } catch {
    // Green Invoice expects a 200 ack regardless; log and move on.
    logger.warn('Merch webhook: unparseable body');
    return NextResponse.json({ received: true });
  }

  const orderId = (payload.custom as string) || undefined;
  logger.info('Merch webhook received', {
    orderId,
    // Avoid logging PII / full payloads in production.
    keys: Object.keys(payload),
  });

  // TODO: mark order paid + trigger POD fulfilment (see file header).

  return NextResponse.json({ received: true });
}
