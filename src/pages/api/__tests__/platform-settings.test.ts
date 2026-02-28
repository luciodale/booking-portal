import { describe, expect, test } from "vitest";
import { z } from "zod";

const putSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

function makeValidBody(overrides: Record<string, unknown> = {}) {
  return {
    key: "some_setting",
    value: "some_value",
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
