import { describe, expect, test } from "vitest";
import { z } from "zod";

const putSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

const applicationFeePercentValidator = z.string().refine(
  (v) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 && n <= 100;
  },
  { message: "Must be an integer between 0 and 100" }
);

function makeValidBody(overrides: Record<string, unknown> = {}) {
  return {
    key: "application_fee_percent",
    value: "10",
    ...overrides,
  };
}

describe("platform settings request validation", () => {
  test("rejects missing key", () => {
    const { key: _, ...rest } = makeValidBody();
    expect(putSettingSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects empty key", () => {
    const result = putSettingSchema.safeParse(makeValidBody({ key: "" }));
    expect(result.success).toBe(false);
  });

  test("accepts valid request", () => {
    const result = putSettingSchema.safeParse(makeValidBody());
    expect(result.success).toBe(true);
  });
});

describe("application_fee_percent value validation", () => {
  test("rejects negative", () => {
    expect(applicationFeePercentValidator.safeParse("-1").success).toBe(false);
  });

  test("rejects above 100", () => {
    expect(applicationFeePercentValidator.safeParse("101").success).toBe(false);
  });

  test("rejects non-integer", () => {
    expect(applicationFeePercentValidator.safeParse("5.5").success).toBe(false);
  });

  test("rejects non-numeric", () => {
    expect(applicationFeePercentValidator.safeParse("abc").success).toBe(false);
  });

  test("accepts 0", () => {
    expect(applicationFeePercentValidator.safeParse("0").success).toBe(true);
  });

  test("accepts 50", () => {
    expect(applicationFeePercentValidator.safeParse("50").success).toBe(true);
  });

  test("accepts 100", () => {
    expect(applicationFeePercentValidator.safeParse("100").success).toBe(true);
  });
});
