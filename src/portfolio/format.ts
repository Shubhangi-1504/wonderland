/**
 * Shared formatting helpers for the portfolio UI.
 *
 * Use these everywhere so numbers look identical across TradePanel and
 * PortfolioScreen. Every function is safe against NaN / Infinity / undefined.
 */

// ─── Number formatters ────────────────────────────────────────────────────────

/**
 * Format a virtual coin amount with thousands separators and 2 decimals.
 * Falls back to "—" for any non-finite input.
 *
 * @example formatCoins(10234.5) → "10,234.50"
 */
export function formatCoins(n: unknown): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Short coin label for chart axes: "$10.5k", "$1.2M", or "$100".
 * Falls back to "—" for non-finite input.
 */
export function formatCoinsShort(n: unknown): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

/**
 * Format a signed percentage. Always shows "+" for positive values.
 * Falls back to "—" for non-finite input.
 *
 * @example formatPct(12.3) → "+12.30%"  |  formatPct(-5) → "-5.00%"
 */
export function formatPct(n: unknown): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

/**
 * Format an epoch-ms timestamp as a localized HH:MM:SS string.
 * Returns "—" for zero or invalid inputs.
 */
export function formatTime(t: unknown): string {
  if (typeof t !== 'number' || t <= 0) return '—';
  return new Date(t).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
