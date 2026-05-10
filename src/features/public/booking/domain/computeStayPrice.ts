/**
 * Price utilities for booking calculations.
 * All arithmetic in cents (integers) to avoid floating-point errors.
 * Uses Date.UTC for timezone-safe day arithmetic on YYYY-MM-DD strings.
 */

import { toCents as _toCents } from "@/modules/money/money";

/** Convert a euro/dollar amount to cents, rounding to nearest integer. */
export const toCents = _toCents;

/** Returns array of YYYY-MM-DD strings from start (inclusive) to end (exclusive). */
export function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const [y1, m1, d1] = start.split("-").map(Number);
  const [y2, m2, d2] = end.split("-").map(Number);
  let ms = Date.UTC(y1, m1 - 1, d1);
  const endMs = Date.UTC(y2, m2 - 1, d2);

  while (ms < endMs) {
    const dt = new Date(ms);
    const year = dt.getUTCFullYear();
    const month = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dt.getUTCDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    ms += 86_400_000;
  }

  return dates;
}
