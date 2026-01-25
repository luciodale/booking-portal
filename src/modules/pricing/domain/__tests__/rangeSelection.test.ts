import { describe, expect, it } from "vitest";
import { computeNextRange } from "../rangeSelection";

// Create dates using UTC to match our UTC-based date handling
const date = (day: number) => new Date(Date.UTC(2025, 0, day)); // January 2025 UTC

describe("computeNextRange", () => {
  describe("no existing selection", () => {
    it("first click selects start date", () => {
      const result = computeNextRange(date(15), undefined);

      expect(result?.from?.getUTCDate()).toBe(15);
      expect(result?.to).toBeUndefined();
    });
  });

  describe("start date selected, no end", () => {
    const range = { from: date(10), to: undefined };

    it("click after start completes range", () => {
      const result = computeNextRange(date(20), range);

      expect(result?.from?.getUTCDate()).toBe(10);
      expect(result?.to?.getUTCDate()).toBe(20);
    });

    it("click on same start date does nothing (no end selected)", () => {
      const result = computeNextRange(date(10), range);

      expect(result).toBe(range); // Same reference
    });

    it("click before start clears selection", () => {
      const result = computeNextRange(date(5), range);

      expect(result).toBeUndefined();
    });
  });

  describe("complete range selected", () => {
    const range = { from: date(10), to: date(20) };

    it("click after end expands range", () => {
      const result = computeNextRange(date(25), range);

      expect(result?.from?.getUTCDate()).toBe(10);
      expect(result?.to?.getUTCDate()).toBe(25);
    });

    it("click on start date clears end date", () => {
      const result = computeNextRange(date(10), range);

      expect(result?.from?.getUTCDate()).toBe(10);
      expect(result?.to).toBeUndefined();
    });

    it("click before start clears selection", () => {
      const result = computeNextRange(date(5), range);

      expect(result).toBeUndefined();
    });

    it("click between start and end adjusts end to that date", () => {
      const result = computeNextRange(date(15), range);

      expect(result?.from?.getUTCDate()).toBe(10);
      expect(result?.to?.getDate()).toBe(15);
    });

    it("click on end date adjusts end (same as between)", () => {
      const result = computeNextRange(date(20), range);

      expect(result?.from?.getUTCDate()).toBe(10);
      expect(result?.to?.getUTCDate()).toBe(20);
    });
  });

  describe("edge cases", () => {
    it("handles dates with different times as same day", () => {
      const morningClick = new Date(2025, 0, 15, 9, 0, 0);
      const eveningStart = new Date(2025, 0, 15, 21, 0, 0);
      const range = { from: eveningStart, to: undefined };

      const result = computeNextRange(morningClick, range);

      expect(result).toBe(range); // Same day = no change
    });

    it("handles undefined from gracefully", () => {
      const result = computeNextRange(date(15), {
        from: undefined,
        to: undefined,
      });

      expect(result?.from?.getUTCDate()).toBe(15);
    });
  });
});
