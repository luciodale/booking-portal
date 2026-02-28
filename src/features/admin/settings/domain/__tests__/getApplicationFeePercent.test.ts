import { describe, expect, test } from "vitest";
import { DEFAULT_APPLICATION_FEE_PERCENT } from "../getApplicationFeePercent";

describe("DEFAULT_APPLICATION_FEE_PERCENT", () => {
  test("is 10", () => {
    expect(DEFAULT_APPLICATION_FEE_PERCENT).toBe(10);
  });
});
