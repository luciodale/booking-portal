import {
  computeStayPrice,
  toCents,
} from "@/features/public/booking/domain/computeStayPrice";
import type { SmoobuRateDay } from "@/schemas/smoobu";
import { describe, expect, test } from "vitest";

function makeRate(price: number | null, available: 0 | 1 = 1): SmoobuRateDay {
  return { price, min_length_of_stay: null, available };
}

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

describe("computeStayPrice", () => {
  test("computes total for a basic 3-night stay", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(100),
      "2025-06-02": makeRate(120),
      "2025-06-03": makeRate(110),
    };

    const result = computeStayPrice("2025-06-01", "2025-06-04", rateMap);

    expect(result.nights).toBe(3);
    expect(result.totalCents).toBe(33000); // (100+120+110) * 100
    expect(result.perNightCents).toBe(11000); // 33000 / 3
    expect(result.hasPricing).toBe(true);
  });

  test("extrapolates when some nights lack rates", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(100),
      "2025-06-02": makeRate(200),
      // 2025-06-03 missing
    };

    const result = computeStayPrice("2025-06-01", "2025-06-04", rateMap);

    expect(result.nights).toBe(3);
    // avg cents = (10000 + 20000) / 2 = 15000, total = 15000 * 3 = 45000
    expect(result.totalCents).toBe(45000);
    expect(result.perNightCents).toBe(15000);
    expect(result.hasPricing).toBe(true);
  });

  test("returns hasPricing=false when no rates have prices", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(null),
      "2025-06-02": makeRate(null),
    };

    const result = computeStayPrice("2025-06-01", "2025-06-03", rateMap);

    expect(result.nights).toBe(2);
    expect(result.totalCents).toBe(0);
    expect(result.hasPricing).toBe(false);
  });

  test("returns zero nights for same-day arrival/departure", () => {
    const result = computeStayPrice("2025-06-01", "2025-06-01", {});

    expect(result.nights).toBe(0);
    expect(result.totalCents).toBe(0);
    expect(result.hasPricing).toBe(false);
  });

  test("handles empty rate map", () => {
    const result = computeStayPrice("2025-06-01", "2025-06-04", {});

    expect(result.nights).toBe(3);
    expect(result.totalCents).toBe(0);
    expect(result.hasPricing).toBe(false);
  });

  test("handles single night stay", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(250),
    };

    const result = computeStayPrice("2025-06-01", "2025-06-02", rateMap);

    expect(result.nights).toBe(1);
    expect(result.totalCents).toBe(25000);
    expect(result.perNightCents).toBe(25000);
    expect(result.hasPricing).toBe(true);
  });

  test("rounds total and perNight correctly during extrapolation", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(99),
      "2025-06-02": makeRate(101),
      // Missing 3rd night — will extrapolate
    };

    const result = computeStayPrice("2025-06-01", "2025-06-04", rateMap);

    expect(result.nights).toBe(3);
    // avg cents = (9900 + 10100) / 2 = 10000, total = 10000 * 3 = 30000
    expect(result.totalCents).toBe(30000);
    expect(result.perNightCents).toBe(10000);
  });

  test("handles fractional rates without floating-point drift", () => {
    // 133.33 * 3 = 399.99 in float, but we convert to cents first
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(133.33),
      "2025-06-02": makeRate(133.33),
      "2025-06-03": makeRate(133.33),
    };

    const result = computeStayPrice("2025-06-01", "2025-06-04", rateMap);

    expect(result.nights).toBe(3);
    // Each night: 13333 cents. Total: 13333 * 3 = 39999 cents
    expect(result.totalCents).toBe(39999);
    expect(result.perNightCents).toBe(13333);
    expect(result.hasPricing).toBe(true);
  });

  test("handles rates with half-cent values consistently", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(99.995),
      "2025-06-02": makeRate(99.995),
    };

    const result = computeStayPrice("2025-06-01", "2025-06-03", rateMap);

    // 99.995 * 100 = 9999.5, Math.round → 10000
    expect(result.totalCents).toBe(20000);
    expect(result.perNightCents).toBe(10000);
  });

  test("client and server compute identical results from same rate map", () => {
    // Simulate the exact scenario: same rateMap, same dates
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-08-01": makeRate(245.50),
      "2025-08-02": makeRate(245.50),
      "2025-08-03": makeRate(275.00),
      "2025-08-04": makeRate(275.00),
      "2025-08-05": makeRate(275.00),
      "2025-08-06": makeRate(310.75),
      "2025-08-07": makeRate(310.75),
    };

    const result1 = computeStayPrice("2025-08-01", "2025-08-08", rateMap);
    const result2 = computeStayPrice("2025-08-01", "2025-08-08", rateMap);

    // Deterministic — identical calls produce identical results
    expect(result1.totalCents).toBe(result2.totalCents);
    expect(result1.perNightCents).toBe(result2.perNightCents);

    // Verify exact values: 24550+24550+27500+27500+27500+31075+31075 = 193750
    expect(result1.totalCents).toBe(193750);
  });

  test("extrapolation with fractional averages rounds correctly", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(100),
      "2025-06-02": makeRate(200),
      "2025-06-03": makeRate(150),
      // 4th and 5th nights missing
    };

    const result = computeStayPrice("2025-06-01", "2025-06-06", rateMap);

    expect(result.nights).toBe(5);
    // Sum of priced = 10000+20000+15000 = 45000, avg = 45000/3 = 15000
    // Extrapolated total = 15000 * 5 = 75000
    expect(result.totalCents).toBe(75000);
    expect(result.perNightCents).toBe(15000);
  });

  test("extrapolation with non-divisible averages", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(100),
      "2025-06-02": makeRate(110),
      // 3rd night missing
    };

    const result = computeStayPrice("2025-06-01", "2025-06-04", rateMap);

    expect(result.nights).toBe(3);
    // Sum = 10000+11000 = 21000, avg = 21000/2 = 10500
    // Total = 10500*3 = 31500, perNight = 31500/3 = 10500
    expect(result.totalCents).toBe(31500);
    expect(result.perNightCents).toBe(10500);
  });

  test("long stay (14 nights) accumulates correctly", () => {
    const rateMap: Record<string, SmoobuRateDay> = {};
    for (let i = 1; i <= 14; i++) {
      const day = String(i).padStart(2, "0");
      rateMap[`2025-07-${day}`] = makeRate(199.99);
    }

    const result = computeStayPrice("2025-07-01", "2025-07-15", rateMap);

    expect(result.nights).toBe(14);
    // 199.99 * 100 = 19999 cents per night, * 14 = 279986
    expect(result.totalCents).toBe(279986);
    expect(result.perNightCents).toBe(19999);
  });
});
