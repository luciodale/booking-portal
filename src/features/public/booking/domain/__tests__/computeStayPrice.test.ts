import { describe, expect, test } from "vitest";
import { getDateRange, toCents } from "../computeStayPrice";

describe("toCents", () => {
  test("converts whole euros to cents", () => {
    expect(toCents(100)).toBe(10000);
    expect(toCents(0)).toBe(0);
    expect(toCents(1)).toBe(100);
  });

  test("converts fractional euros to cents", () => {
    expect(toCents(133.33)).toBe(13333);
    expect(toCents(99.99)).toBe(9999);
    expect(toCents(0.01)).toBe(1);
    expect(toCents(0.005)).toBe(1); // rounds up
    expect(toCents(0.004)).toBe(0); // rounds down
  });

  test("handles notorious floating-point values", () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JS
    expect(toCents(0.1 + 0.2)).toBe(30);
    // 1.005 * 100 = 100.4999... in IEEE 754, so Math.round gives 100
    expect(toCents(1.005)).toBe(100);
  });
});

describe("getDateRange", () => {
  test("returns correct range for multi-day stay", () => {
    expect(getDateRange("2025-06-01", "2025-06-04")).toEqual([
      "2025-06-01",
      "2025-06-02",
      "2025-06-03",
    ]);
  });

  test("returns single date for one-night stay", () => {
    expect(getDateRange("2025-06-01", "2025-06-02")).toEqual(["2025-06-01"]);
  });

  test("returns empty array for same-day", () => {
    expect(getDateRange("2025-06-01", "2025-06-01")).toEqual([]);
  });

  test("handles month boundary", () => {
    expect(getDateRange("2025-01-30", "2025-02-02")).toEqual([
      "2025-01-30",
      "2025-01-31",
      "2025-02-01",
    ]);
  });
});
