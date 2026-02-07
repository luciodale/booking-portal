/**
 * Range Selection Domain Logic
 * Computes next range state based on user clicks
 */

import type { DateRange } from "../domain/types";

/**
 * Compute the next range based on the current range and a new date click
 */
export function computeNextRange(
  date: Date,
  currentRange?: DateRange
): DateRange | undefined {
  // No current selection -> start new range
  if (!currentRange?.from) {
    return { from: date };
  }

  // Has start but no end -> complete range
  if (!currentRange.to) {
    const from = currentRange.from;
    if (date < from) {
      return { from: date, to: from };
    }
    return { from, to: date };
  }

  // Has complete range -> start new selection
  return { from: date };
}
