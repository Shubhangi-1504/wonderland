/**
 * Output + input hygiene for the LLM proxy. Keep this list short and obvious.
 * If a reply matches, we swap it for the safe canned answer.
 */

const UNSAFE_PATTERNS: RegExp[] = [
  // Promises of certainty, the classic finance-scam phrasing.
  /guaranteed\s+(returns?|profits?|money|gains?|income)/i,
  /risk[- ]?free\s+(profit|returns?|money|gains?)/i,
  /(double|triple)\s+your\s+money/i,
  // Direct trading instructions about a named/real-looking ticker.
  /\b(you\s+should|i\s+recommend\s+(that\s+)?you|definitely)\s+(buy|sell|short)\b/i,
  /\b(buy|sell)\s+\$?[A-Z]{2,5}\b/,
  /\b(buy|sell)\s+(tesla|apple|nvidia|amazon|microsoft|meta|google|bitcoin|btc|ethereum)\b/i,
];

/** True when the model reply must not reach the UI. */
export function isUnsafeReply(text: string): boolean {
  if (!text) return true;
  return UNSAFE_PATTERNS.some((pattern) => pattern.test(text));
}

/** Remove ASCII control characters (keeps newlines/tabs) and trim. */
export function stripControlChars(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
}
