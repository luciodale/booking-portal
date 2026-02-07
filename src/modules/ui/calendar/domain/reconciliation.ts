/**
 * Pricing Period Reconciliation
 * Handles overlap resolution when adding new pricing periods
 */

import type { PricingPeriod } from "../domain/types";

type ReconciliationResult = {
  toAdd: Omit<PricingPeriod, "id">[];
  toUpdate: PricingPeriod[];
  toDelete: string[];
};

/**
 * Reconcile a new pricing period with existing periods
 * - New period takes precedence over overlapping periods
 * - Fully contained periods are deleted
 * - Partially overlapping periods are trimmed
 */
export function reconcilePricingPeriods(
  newPeriod: Omit<PricingPeriod, "id">,
  existingPeriods: PricingPeriod[]
): ReconciliationResult {
  const toAdd: Omit<PricingPeriod, "id">[] = [newPeriod];
  const toUpdate: PricingPeriod[] = [];
  const toDelete: string[] = [];

  for (const existing of existingPeriods) {
    const newStart = newPeriod.startDate.getTime();
    const newEnd = newPeriod.endDate.getTime();
    const existStart = existing.startDate.getTime();
    const existEnd = existing.endDate.getTime();

    // No overlap
    if (newEnd < existStart || newStart > existEnd) {
      continue;
    }

    // New period fully contains existing -> delete existing
    if (newStart <= existStart && newEnd >= existEnd) {
      toDelete.push(existing.id);
      continue;
    }

    // Existing fully contains new -> split existing into two parts
    if (existStart < newStart && existEnd > newEnd) {
      // Create left portion
      toAdd.push({
        ...existing,
        endDate: new Date(newStart - 86400000), // day before new start
      });
      // Update to become right portion
      toUpdate.push({
        ...existing,
        startDate: new Date(newEnd + 86400000), // day after new end
      });
      continue;
    }

    // Partial overlap at start of existing
    if (newStart <= existStart && newEnd < existEnd) {
      toUpdate.push({
        ...existing,
        startDate: new Date(newEnd + 86400000),
      });
      continue;
    }

    // Partial overlap at end of existing
    if (newStart > existStart && newEnd >= existEnd) {
      toUpdate.push({
        ...existing,
        endDate: new Date(newStart - 86400000),
      });
    }
  }

  return { toAdd, toUpdate, toDelete };
}
