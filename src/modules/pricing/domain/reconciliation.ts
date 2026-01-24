import type { PricingPeriod } from "./types";

interface ReconcileResult {
  toAdd: Omit<PricingPeriod, "id">[];
  toUpdate: PricingPeriod[];
  toDelete: string[];
}

/**
 * Reconciles a new pricing period with existing ones.
 * - If new range fully contains an old range, delete old range.
 * - If new range partially overlaps, adjust old range start/end.
 * - New range always overrides.
 */
export function reconcilePricingPeriods(
  newPeriod: Omit<PricingPeriod, "id">,
  existingPeriods: PricingPeriod[]
): ReconcileResult {
  const result: ReconcileResult = {
    toAdd: [newPeriod],
    toUpdate: [],
    toDelete: [],
  };

  const newStart = new Date(newPeriod.startDate);
  const newEnd = new Date(newPeriod.endDate);
  // Ensure time parts are zeroed for comparison
  newStart.setUTCHours(0, 0, 0, 0);
  newEnd.setUTCHours(23, 59, 59, 999);

  for (const existing of existingPeriods) {
    const exStart = new Date(existing.startDate);
    const exEnd = new Date(existing.endDate);
    exStart.setUTCHours(0, 0, 0, 0);
    exEnd.setUTCHours(23, 59, 59, 999);

    // Case 1: No overlap
    if (exEnd < newStart || exStart > newEnd) {
      continue;
    }

    // Case 2: New fully contains Existing -> Delete Existing
    if (newStart <= exStart && newEnd >= exEnd) {
      result.toDelete.push(existing.id);
      continue;
    }

    // Case 3: Partial Overlap
    // 3a. Existing fully contains New -> Split Existing into two
    if (exStart < newStart && exEnd > newEnd) {
      // Modify existing to end before new period
      const firstPartEnd = new Date(newStart);
      firstPartEnd.setUTCDate(firstPartEnd.getUTCDate() - 1);

      result.toUpdate.push({
        ...existing,
        endDate: firstPartEnd,
      });

      // Add new period for the second part of existing
      const secondPartStart = new Date(newEnd);
      secondPartStart.setUTCDate(secondPartStart.getUTCDate() + 1);

      // We can't "add" an ID-less period to 'toUpdate'.
      // Current system implies we must CREATE a new period for the split.
      // So we effectively update existing to be the "left" side, and create a new one for "right" side.
      // Wait, 'toAdd' is for the NEW period. We can add another one to 'toAdd'.
      // But we need to copy properties from existing.
      result.toAdd.push({
        startDate: secondPartStart,
        endDate: existing.endDate,
        price: existing.price,
        percentageAdjustment: existing.percentageAdjustment,
        label: existing.label,
      });
      continue;
    }

    // 3b. Overlap at the end of Existing (Existing starts before New, ends inside New)
    if (exStart < newStart && exEnd >= newStart) {
      // Adjust existing end date to be day before new start
      const adjustedEnd = new Date(newStart);
      adjustedEnd.setUTCDate(adjustedEnd.getUTCDate() - 1);
      result.toUpdate.push({
        ...existing,
        endDate: adjustedEnd,
      });
      continue;
    }

    // 3c. Overlap at start of Existing (Existing starts inside New, ends after New)
    if (exStart <= newEnd && exEnd > newEnd) {
      // Adjust existing start date to be day after new end
      const adjustedStart = new Date(newEnd);
      adjustedStart.setUTCDate(adjustedStart.getUTCDate() + 1);
      result.toUpdate.push({
        ...existing,
        startDate: adjustedStart,
      });
      continue;
    }
  }

  return result;
}
