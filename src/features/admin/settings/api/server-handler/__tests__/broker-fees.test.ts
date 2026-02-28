import { describe, expect, test } from "vitest";
import { z } from "zod";

const putBrokerFeeSchema = z.object({
  userId: z.string().min(1),
  feePercent: z.number().int().min(0).max(100),
});

const deleteBrokerFeeSchema = z.object({
  userId: z.string().min(1),
});

function makeValidPutBody(overrides: Record<string, unknown> = {}) {
  return {
    userId: "user-123",
    feePercent: 15,
    ...overrides,
  };
}

describe("putBrokerFeeSchema", () => {
  test("accepts valid request", () => {
    expect(putBrokerFeeSchema.safeParse(makeValidPutBody()).success).toBe(true);
  });

  test("accepts boundary value 0", () => {
    const result = putBrokerFeeSchema.safeParse(
      makeValidPutBody({ feePercent: 0 })
    );
    expect(result.success).toBe(true);
  });

  test("accepts boundary value 100", () => {
    const result = putBrokerFeeSchema.safeParse(
      makeValidPutBody({ feePercent: 100 })
    );
    expect(result.success).toBe(true);
  });

  test("rejects missing userId", () => {
    const { userId: _, ...rest } = makeValidPutBody();
    expect(putBrokerFeeSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects empty userId", () => {
    const result = putBrokerFeeSchema.safeParse(
      makeValidPutBody({ userId: "" })
    );
    expect(result.success).toBe(false);
  });

  test("rejects missing feePercent", () => {
    const { feePercent: _, ...rest } = makeValidPutBody();
    expect(putBrokerFeeSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects non-integer feePercent", () => {
    const result = putBrokerFeeSchema.safeParse(
      makeValidPutBody({ feePercent: 10.5 })
    );
    expect(result.success).toBe(false);
  });

  test("rejects negative feePercent", () => {
    const result = putBrokerFeeSchema.safeParse(
      makeValidPutBody({ feePercent: -1 })
    );
    expect(result.success).toBe(false);
  });

  test("rejects feePercent above 100", () => {
    const result = putBrokerFeeSchema.safeParse(
      makeValidPutBody({ feePercent: 101 })
    );
    expect(result.success).toBe(false);
  });

  test("rejects string feePercent", () => {
    const result = putBrokerFeeSchema.safeParse(
      makeValidPutBody({ feePercent: "15" })
    );
    expect(result.success).toBe(false);
  });
});

describe("deleteBrokerFeeSchema", () => {
  test("accepts valid userId", () => {
    expect(
      deleteBrokerFeeSchema.safeParse({ userId: "user-123" }).success
    ).toBe(true);
  });

  test("rejects missing userId", () => {
    expect(deleteBrokerFeeSchema.safeParse({}).success).toBe(false);
  });

  test("rejects empty userId", () => {
    expect(deleteBrokerFeeSchema.safeParse({ userId: "" }).success).toBe(
      false
    );
  });
});
