import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time string comparison. Use for secrets/tokens (cron, webhook) so
 * the comparison can't be timed byte-by-byte. Length-guards before
 * timingSafeEqual (which throws on length mismatch).
 */
export function secureEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
