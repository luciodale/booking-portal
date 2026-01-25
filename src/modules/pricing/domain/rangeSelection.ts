import type { DateRange } from "./types";

/**
 * Computes the next range state based on a clicked date.
 *
 * Selection behavior:
 * - First click: selects start date
 * - Click after start (no end): completes range
 * - Click on start date (no end): no change
 * - Click on start date (with end): clears end date
 * - Click before start: clears selection
 * - Click after end: expands range
 * - Click between start and end: adjusts end to clicked date
 */
export function computeNextRange(
  clickedDate: Date,
  currentRange: DateRange | undefined
): DateRange | undefined {
  // Normalize to start of day for comparison
  const clicked = startOfDay(clickedDate);

  // No selection yet → start new range
  if (!currentRange?.from) {
    return { from: clicked, to: undefined };
  }

  const start = startOfDay(currentRange.from);
  const end = currentRange.to ? startOfDay(currentRange.to) : undefined;

  // Click on start date → clear end if exists, otherwise complete single-day selection
  if (isSameDay(clicked, start)) {
    if (end) {
      return { from: start, to: undefined };
    }
    // Single day selection: set to = from
    return { from: start, to: start };
  }

  // Click before start → clear selection
  if (clicked < start) {
    return undefined;
  }

  // No end selected yet, click after start → complete range
  if (!end) {
    return { from: start, to: clicked };
  }

  // End exists, click after end → expand range
  if (clicked > end) {
    return { from: start, to: clicked };
  }

  // Click between start and end (exclusive) → complete range to that date
  // This provides intuitive behavior for adjusting selections
  return { from: start, to: clicked };
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

