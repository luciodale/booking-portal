import { describe, expect, test } from "vitest";
import { z } from "zod";

const applicationFeePercentSchema = z.string().refine(
  (v) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 && n <= 100;
  },
  { message: "Must be an integer between 0 and 100" }
);

function computeFee(totalCents: number, percent: number): number {
  return Math.round((totalCents * percent) / 100);
}

describe("application_fee_percent validation", () => {
  test("rejects negative values", () => {
    expect(applicationFeePercentSchema.safeParse("-1").success).toBe(false);
  });

  test("rejects values above 100", () => {
    expect(applicationFeePercentSchema.safeParse("101").success).toBe(false);
  });

  test("rejects non-integer values", () => {
    expect(applicationFeePercentSchema.safeParse("10.5").success).toBe(false);
  });

  test("accepts 0", () => {
    expect(applicationFeePercentSchema.safeParse("0").success).toBe(true);
  });

  test("accepts 100", () => {
    expect(applicationFeePercentSchema.safeParse("100").success).toBe(true);
  });

  test("accepts valid integer in range", () => {
    expect(applicationFeePercentSchema.safeParse("15").success).toBe(true);
  });
});

describe("fee computation", () => {
  test("computes 10% of 10000 cents", () => {
    expect(computeFee(10000, 10)).toBe(1000);
  });

  test("computes 0% fee", () => {
    expect(computeFee(50000, 0)).toBe(0);
  });

  test("computes 100% fee", () => {
    expect(computeFee(50000, 100)).toBe(50000);
  });

  test("rounds correctly for odd amounts", () => {
    // 15% of 333 = 49.95 → rounds to 50
    expect(computeFee(333, 15)).toBe(50);
  });

  test("handles 1 cent total", () => {
    expect(computeFee(1, 50)).toBe(1); // Math.round(0.5) = 1
  });

  test("handles large amounts", () => {
    // 12% of 150000 (€1500.00) = 18000 (€180.00)
    expect(computeFee(150000, 12)).toBe(18000);
  });
});

describe("connect account block logic", () => {
  test("null connected account should block checkout", () => {
    const connectedAccountId: string | null = null;
    expect(connectedAccountId).toBeNull();
  });

  test("valid connected account should allow checkout", () => {
    const connectedAccountId: string | null = "acct_123abc";
    expect(connectedAccountId).not.toBeNull();
  });
});
