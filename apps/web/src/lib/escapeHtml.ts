/**
 * Escape user-controlled values before interpolating into HTML (email bodies).
 * Prevents content/markup injection from fields like vote titles, display names,
 * and refund reasons reaching recipients' inboxes.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
