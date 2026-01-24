import { toUniversalISODate } from "@/modules/utils/dates";
import { describe, expect, it } from "vitest";
import { reconcilePricingPeriods } from "./reconciliation";
import type { PricingPeriod } from "./types";

describe("reconcilePricingPeriods", () => {
  const createDate = (str: string) => new Date(str);

  // Helper to create a dummy existing period
  const createPeriod = (
    id: string,
    start: string,
    end: string,
    price = 100
  ): PricingPeriod => ({
    id,
    startDate: createDate(start),
    endDate: createDate(end),
    price,
  });

  it("should just add new period if no overlap", () => {
    const existing = [createPeriod("1", "2024-01-01", "2024-01-05")];
    const newPeriod = {
      startDate: createDate("2024-01-10"),
      endDate: createDate("2024-01-15"),
      price: 200,
    };

    const result = reconcilePricingPeriods(newPeriod, existing);
    expect(result.toAdd).toHaveLength(1); // The new one
    expect(result.toAdd[0]).toEqual(newPeriod);
    expect(result.toUpdate).toHaveLength(0);
    expect(result.toDelete).toHaveLength(0);
  });

  it("should delete existing period if new fully contains it", () => {
    const existing = [createPeriod("1", "2024-01-05", "2024-01-07")];
    const newPeriod = {
      startDate: createDate("2024-01-01"),
      endDate: createDate("2024-01-10"),
      price: 200,
    };

    const result = reconcilePricingPeriods(newPeriod, existing);
    expect(result.toDelete).toContain("1");
    expect(result.toUpdate).toHaveLength(0);
  });

  it("should trim end of existing period if new overlaps start", () => {
    // Existing: 1st - 10th
    // New: 8th - 15th
    // Result: Existing becomes 1st - 7th
    const existing = [createPeriod("1", "2024-01-01", "2024-01-10")];
    const newPeriod = {
      startDate: createDate("2024-01-08"),
      endDate: createDate("2024-01-15"),
      price: 200,
    };

    const result = reconcilePricingPeriods(newPeriod, existing);
    expect(result.toUpdate).toHaveLength(1);
    expect(result.toUpdate[0].id).toBe("1");
    // Check date strings for simplicity (UTC check might be needed in real app)
    expect(toUniversalISODate(result.toUpdate[0].endDate)).toBe("2024-01-07");
  });

  it("should trim start of existing period if new overlaps end", () => {
    // Existing: 10th - 20th
    // New: 5th - 12th
    // Result: Existing becomes 13th - 20th
    const existing = [createPeriod("1", "2024-01-10", "2024-01-20")];
    const newPeriod = {
      startDate: createDate("2024-01-05"),
      endDate: createDate("2024-01-12"),
      price: 200,
    };

    const result = reconcilePricingPeriods(newPeriod, existing);
    expect(result.toUpdate).toHaveLength(1);
    expect(result.toUpdate[0].id).toBe("1");
    expect(toUniversalISODate(result.toUpdate[0].startDate)).toBe("2024-01-13");
  });

  it("should split existing period if new is in the middle", () => {
    // Existing: 1st - 20th
    // New: 10th - 15th
    // Result:
    //  - Update Existing to 1st - 9th
    //  - Add Splinter Period 16th - 20th (copy of existing)
    //  - Add New Period (handled by default toAdd)
    const existing = [createPeriod("1", "2024-01-01", "2024-01-20")];
    const newPeriod = {
      startDate: createDate("2024-01-10"),
      endDate: createDate("2024-01-15"),
      price: 200,
    };

    const result = reconcilePricingPeriods(newPeriod, existing);

    // Check update
    expect(result.toUpdate).toHaveLength(1);
    expect(result.toUpdate[0].id).toBe("1");
    expect(toUniversalISODate(result.toUpdate[0].endDate)).toBe("2024-01-09");

    // Check additions (New Period + Splinter)
    expect(result.toAdd).toHaveLength(2);

    // Find splinter
    const splinter = result.toAdd.find((p) => p.price === 100);
    expect(splinter).toBeDefined();
    if (splinter) {
      expect(toUniversalISODate(splinter.startDate)).toBe("2024-01-16");
      expect(toUniversalISODate(splinter.endDate)).toBe("2024-01-20");
    }
  });
});
