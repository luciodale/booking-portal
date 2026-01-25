/**
 * Unit tests for date utilities
 * Tests UTC consistency across timezones
 */

import { describe, expect, it } from "vitest";
import {
  compareDateStrings,
  formatDateDisplay,
  fromDateString,
  isSameDateString,
  toDateString,
  toUTCTimestamp,
} from "../dates";

describe("dates utilities", () => {
  describe("toDateString", () => {
    it("converts Date to YYYY-MM-DD using UTC", () => {
      const date = new Date("2023-10-27T00:00:00.000Z");
      expect(toDateString(date)).toBe("2023-10-27");
    });

    it("handles dates with time components correctly", () => {
      const date = new Date("2023-10-27T15:30:45.123Z");
      expect(toDateString(date)).toBe("2023-10-27");
    });

    it("preserves date regardless of timezone", () => {
      // Create date at UTC midnight
      const date = new Date(Date.UTC(2023, 0, 15, 0, 0, 0));
      expect(toDateString(date)).toBe("2023-01-15");
    });
  });

  describe("fromDateString", () => {
    it("parses YYYY-MM-DD to UTC midnight", () => {
      const date = fromDateString("2023-10-27");
      expect(date.toISOString()).toBe("2023-10-27T00:00:00.000Z");
    });

    it("handles leap year dates", () => {
      const date = fromDateString("2024-02-29");
      expect(date.toISOString()).toBe("2024-02-29T00:00:00.000Z");
    });

    it("handles year boundaries", () => {
      const date = fromDateString("2023-12-31");
      expect(date.toISOString()).toBe("2023-12-31T00:00:00.000Z");
    });
  });

  describe("round-trip conversion", () => {
    it("preserves date through round-trip conversion", () => {
      const original = "2023-10-27";
      const date = fromDateString(original);
      const converted = toDateString(date);
      expect(converted).toBe(original);
    });

    it("works for various dates", () => {
      const dates = [
        "2023-01-01",
        "2023-06-15",
        "2023-12-31",
        "2024-02-29", // leap year
        "2023-07-04",
      ];

      for (const dateStr of dates) {
        const roundTrip = toDateString(fromDateString(dateStr));
        expect(roundTrip).toBe(dateStr);
      }
    });
  });

  describe("timezone independence", () => {
    it("produces same result regardless of local timezone simulation", () => {
      // Test dates that might be problematic in different timezones
      const testCases = [
        "2023-01-01", // New Year
        "2023-07-04", // Mid-year
        "2023-12-31", // End of year
      ];

      for (const dateStr of testCases) {
        const date = fromDateString(dateStr);
        
        // Verify UTC components
        expect(date.getUTCFullYear()).toBe(Number.parseInt(dateStr.substring(0, 4)));
        expect(date.getUTCMonth()).toBe(Number.parseInt(dateStr.substring(5, 7)) - 1);
        expect(date.getUTCDate()).toBe(Number.parseInt(dateStr.substring(8, 10)));
        expect(date.getUTCHours()).toBe(0);
        expect(date.getUTCMinutes()).toBe(0);
        expect(date.getUTCSeconds()).toBe(0);
        expect(date.getUTCMilliseconds()).toBe(0);
      }
    });
  });

  describe("compareDateStrings", () => {
    it("returns -1 when first date is earlier", () => {
      expect(compareDateStrings("2023-01-15", "2023-01-20")).toBe(-1);
    });

    it("returns 1 when first date is later", () => {
      expect(compareDateStrings("2023-01-20", "2023-01-15")).toBe(1);
    });

    it("returns 0 when dates are equal", () => {
      expect(compareDateStrings("2023-01-15", "2023-01-15")).toBe(0);
    });

    it("works across year boundaries", () => {
      expect(compareDateStrings("2022-12-31", "2023-01-01")).toBe(-1);
      expect(compareDateStrings("2023-01-01", "2022-12-31")).toBe(1);
    });
  });

  describe("isSameDateString", () => {
    it("returns true for identical dates", () => {
      expect(isSameDateString("2023-01-15", "2023-01-15")).toBe(true);
    });

    it("returns false for different dates", () => {
      expect(isSameDateString("2023-01-15", "2023-01-16")).toBe(false);
    });
  });

  describe("toUTCTimestamp", () => {
    it("returns full ISO string with timestamp", () => {
      const date = new Date("2023-10-27T14:30:00.000Z");
      expect(toUTCTimestamp(date)).toBe("2023-10-27T14:30:00.000Z");
    });
  });

  describe("formatDateDisplay", () => {
    it("formats Date object for display", () => {
      const date = new Date("2023-10-27T00:00:00.000Z");
      const formatted = formatDateDisplay(date);
      expect(formatted).toMatch(/Oct 27, 2023/);
    });

    it("formats date string for display", () => {
      const formatted = formatDateDisplay("2023-10-27");
      expect(formatted).toMatch(/Oct 27, 2023/);
    });
  });
});

