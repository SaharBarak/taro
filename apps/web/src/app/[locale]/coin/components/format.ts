/**
 * Shared mono-tabular formatters for the BAGS market surface.
 * Hebrew locale, ILS, signed percentages.
 */

export const WHATSAPP_LINK = 'https://chat.whatsapp.com/FITvea9IVsn2Ljie1yCrAc';

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('he-IL').format(Number.isFinite(num) ? num : 0);

/**
 * Signed percentage from a decimal change (0.23 → "+23.0%").
 * Sign is explicit so callers can colour red (+) / ink (−).
 */
export const formatPercent = (decimal: number): string => {
  const pct = (Number.isFinite(decimal) ? decimal : 0) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
};

/** Truncate a Solana mint/hash for compact mono display. */
export const truncateHash = (hash: string, head = 6, tail = 6): string =>
  hash.length <= head + tail + 1 ? hash : `${hash.slice(0, head)}…${hash.slice(-tail)}`;
