/**
 * Price utilities for booking calculations.
 * All arithmetic in cents (integers) to avoid floating-point errors.
 * No Date objects — works with YYYY-MM-DD strings for Cloudflare Workers compatibility.
 */

/** Convert a euro/dollar amount to cents, rounding to nearest integer. */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Returns array of YYYY-MM-DD strings from start (inclusive) to end (exclusive). */
export function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  while (current < endDate) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
