import { describe, expect, test } from "vitest";

function parseApplicationFeePercent(value: string | undefined): number {
  if (value == null) return 0;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 100) return 0;
  return n;
}

describe("getApplicationFeePercent", () => {
  test("returns 0 when no setting exists", () => {
    expect(parseApplicationFeePercent(undefined)).toBe(0);
  });

  test("parses stored string to number", () => {
    expect(parseApplicationFeePercent("15")).toBe(15);
  });

  test("returns 0 for non-integer strings", () => {
    expect(parseApplicationFeePercent("10.5")).toBe(0);
  });

  test("returns 0 for negative values", () => {
    expect(parseApplicationFeePercent("-5")).toBe(0);
  });

  test("returns 0 for values above 100", () => {
    expect(parseApplicationFeePercent("150")).toBe(0);
  });

  test("accepts boundary value 0", () => {
    expect(parseApplicationFeePercent("0")).toBe(0);
  });

  test("accepts boundary value 100", () => {
    expect(parseApplicationFeePercent("100")).toBe(100);
  });

  test("returns 0 for non-numeric strings", () => {
    expect(parseApplicationFeePercent("abc")).toBe(0);
  });
});
