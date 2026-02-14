import { computeStayPrice } from "@/features/public/booking/domain/computeStayPrice";
import type { SmoobuRateDay } from "@/schemas/smoobu";
import { describe, expect, test } from "vitest";

function makeRate(price: number | null, available: 0 | 1 = 1): SmoobuRateDay {
  return { price, min_length_of_stay: null, available };
}

describe("computeStayPrice", () => {
  test("computes total for a basic 3-night stay", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(100),
      "2025-06-02": makeRate(120),
      "2025-06-03": makeRate(110),
    };

    const result = computeStayPrice("2025-06-01", "2025-06-04", rateMap);

    expect(result.nights).toBe(3);
    expect(result.total).toBe(330);
    expect(result.perNight).toBe(110);
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
    // Average of priced = (100 + 200) / 2 = 150, total = 150 * 3 = 450
    expect(result.total).toBe(450);
    expect(result.perNight).toBe(150);
    expect(result.hasPricing).toBe(true);
  });

  test("returns hasPricing=false when no rates have prices", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(null),
      "2025-06-02": makeRate(null),
    };

    const result = computeStayPrice("2025-06-01", "2025-06-03", rateMap);

    expect(result.nights).toBe(2);
    expect(result.total).toBe(0);
    expect(result.hasPricing).toBe(false);
  });

  test("returns zero nights for same-day arrival/departure", () => {
    const result = computeStayPrice("2025-06-01", "2025-06-01", {});

    expect(result.nights).toBe(0);
    expect(result.total).toBe(0);
    expect(result.hasPricing).toBe(false);
  });

  test("handles empty rate map", () => {
    const result = computeStayPrice("2025-06-01", "2025-06-04", {});

    expect(result.nights).toBe(3);
    expect(result.total).toBe(0);
    expect(result.hasPricing).toBe(false);
  });

  test("handles single night stay", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(250),
    };

    const result = computeStayPrice("2025-06-01", "2025-06-02", rateMap);

    expect(result.nights).toBe(1);
    expect(result.total).toBe(250);
    expect(result.perNight).toBe(250);
    expect(result.hasPricing).toBe(true);
  });

  test("rounds total and perNight correctly", () => {
    const rateMap: Record<string, SmoobuRateDay> = {
      "2025-06-01": makeRate(99),
      "2025-06-02": makeRate(101),
      // Missing 3rd night — will extrapolate
    };

    const result = computeStayPrice("2025-06-01", "2025-06-04", rateMap);

    expect(result.nights).toBe(3);
    // avg = 100, total = 300
    expect(result.total).toBe(300);
    expect(result.perNight).toBe(100);
  });
});
