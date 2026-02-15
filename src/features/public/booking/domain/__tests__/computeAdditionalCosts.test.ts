import { describe, expect, test } from "vitest";
import {
  computeExperienceAdditionalCosts,
  computePropertyAdditionalCosts,
  formatPropertyCostPreview,
} from "../computeAdditionalCosts";

describe("computePropertyAdditionalCosts", () => {
  test("returns empty for null/empty costs", () => {
    expect(
      computePropertyAdditionalCosts(null, {
        nights: 3,
        guests: 2,
        currency: "EUR",
      })
    ).toEqual([]);
    expect(
      computePropertyAdditionalCosts([], {
        nights: 3,
        guests: 2,
        currency: "EUR",
      })
    ).toEqual([]);
  });

  test("stay cost is flat amount", () => {
    const result = computePropertyAdditionalCosts(
      [{ label: "Cleaning fee", amount: 5000, per: "stay" }],
      { nights: 3, guests: 2, currency: "EUR" }
    );
    expect(result).toEqual([{ label: "Cleaning fee", amountCents: 5000 }]);
  });

  test("night cost multiplied by nights", () => {
    const result = computePropertyAdditionalCosts(
      [{ label: "Linen fee", amount: 1000, per: "night" }],
      { nights: 4, guests: 2, currency: "EUR" }
    );
    expect(result[0].amountCents).toBe(4000);
    expect(result[0].detail).toContain("/night");
  });

  test("guest cost multiplied by guests", () => {
    const result = computePropertyAdditionalCosts(
      [{ label: "Towel fee", amount: 500, per: "guest" }],
      { nights: 3, guests: 3, currency: "EUR" }
    );
    expect(result[0].amountCents).toBe(1500);
    expect(result[0].detail).toContain("/guest");
  });

  test("night_per_guest cost multiplied by nights * guests", () => {
    const result = computePropertyAdditionalCosts(
      [{ label: "Tourist tax", amount: 350, per: "night_per_guest" }],
      { nights: 5, guests: 2, currency: "EUR" }
    );
    expect(result[0].amountCents).toBe(3500);
    expect(result[0].detail).toContain("/night/guest");
  });

  test("night_per_guest respects maxNights cap", () => {
    const result = computePropertyAdditionalCosts(
      [
        {
          label: "Tourist tax",
          amount: 350,
          per: "night_per_guest",
          maxNights: 3,
        },
      ],
      { nights: 10, guests: 2, currency: "EUR" }
    );
    // 350 * min(10, 3) * 2 = 350 * 3 * 2 = 2100
    expect(result[0].amountCents).toBe(2100);
    expect(result[0].detail).toContain("max 3 nights");
  });

  test("maxNights has no effect when nights < maxNights", () => {
    const result = computePropertyAdditionalCosts(
      [
        {
          label: "Tourist tax",
          amount: 350,
          per: "night_per_guest",
          maxNights: 10,
        },
      ],
      { nights: 3, guests: 2, currency: "EUR" }
    );
    expect(result[0].amountCents).toBe(2100);
  });

  test("multiple costs combined", () => {
    const result = computePropertyAdditionalCosts(
      [
        { label: "Cleaning", amount: 5000, per: "stay" },
        { label: "Tax", amount: 200, per: "night_per_guest" },
      ],
      { nights: 3, guests: 2, currency: "EUR" }
    );
    expect(result).toHaveLength(2);
    expect(result[0].amountCents).toBe(5000);
    expect(result[1].amountCents).toBe(1200);
  });
});

describe("computeExperienceAdditionalCosts", () => {
  test("returns empty for null/empty costs", () => {
    expect(
      computeExperienceAdditionalCosts(null, {
        participants: 2,
        currency: "EUR",
      })
    ).toEqual([]);
    expect(
      computeExperienceAdditionalCosts([], { participants: 2, currency: "EUR" })
    ).toEqual([]);
  });

  test("booking cost is flat amount", () => {
    const result = computeExperienceAdditionalCosts(
      [{ label: "Equipment rental", amount: 3000, per: "booking" }],
      { participants: 4, currency: "EUR" }
    );
    expect(result).toEqual([{ label: "Equipment rental", amountCents: 3000 }]);
  });

  test("participant cost multiplied by participants", () => {
    const result = computeExperienceAdditionalCosts(
      [{ label: "Insurance", amount: 500, per: "participant" }],
      { participants: 3, currency: "EUR" }
    );
    expect(result[0].amountCents).toBe(1500);
    expect(result[0].detail).toContain("/participant");
  });
});

describe("formatPropertyCostPreview", () => {
  test("returns empty for null/empty", () => {
    expect(formatPropertyCostPreview(null, "EUR")).toEqual([]);
  });

  test("stay costs show full amount", () => {
    const result = formatPropertyCostPreview(
      [{ label: "Cleaning", amount: 5000, per: "stay" }],
      "EUR"
    );
    expect(result[0].amountCents).toBe(5000);
    expect(result[0].detail).toBeUndefined();
  });

  test("guest-dependent costs show rate string with zero amount", () => {
    const result = formatPropertyCostPreview(
      [
        { label: "Night fee", amount: 1000, per: "night" },
        { label: "Guest fee", amount: 500, per: "guest" },
        { label: "Tax", amount: 350, per: "night_per_guest", maxNights: 7 },
      ],
      "EUR"
    );
    expect(result).toHaveLength(3);
    expect(result[0].amountCents).toBe(0);
    expect(result[0].detail).toContain("/night");
    expect(result[1].amountCents).toBe(0);
    expect(result[1].detail).toContain("/guest");
    expect(result[2].amountCents).toBe(0);
    expect(result[2].detail).toContain("/night/guest");
    expect(result[2].detail).toContain("max 7 nights");
  });
});
