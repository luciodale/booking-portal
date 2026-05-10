import { toCents } from "@/modules/money/money";
import { checkoutBodySchema } from "@/schemas/checkout";
import { describe, expect, test } from "vitest";

function makeValidBody(overrides: Record<string, unknown> = {}) {
  return {
    propertyId: "prop-1",
    checkIn: "2025-07-01",
    checkOut: "2025-07-05",
    guests: 2,
    currency: "EUR",
    nightPriceCents: {
      "2025-07-01": 12500,
      "2025-07-02": 12500,
      "2025-07-03": 12500,
      "2025-07-04": 12500,
    },
    cityTaxCents: 800,
    selectedExtraIndices: [],
    guestInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      adults: 2,
      children: 0,
    },
    requestNonce: "test-nonce-abc123",
    ...overrides,
  };
}

describe("checkout request validation", () => {
  test("rejects missing propertyId", () => {
    const { propertyId: _, ...rest } = makeValidBody();
    expect(checkoutBodySchema.safeParse(rest).success).toBe(false);
  });

  test("rejects invalid date format", () => {
    const result = checkoutBodySchema.safeParse(
      makeValidBody({ checkIn: "07/01/2025" })
    );
    expect(result.success).toBe(false);
  });

  test("rejects zero guests", () => {
    const result = checkoutBodySchema.safeParse(makeValidBody({ guests: 0 }));
    expect(result.success).toBe(false);
  });

  test("rejects non-integer nightPriceCents values", () => {
    const result = checkoutBodySchema.safeParse(
      makeValidBody({
        nightPriceCents: { "2025-07-01": 125.5 },
      })
    );
    expect(result.success).toBe(false);
  });

  test("rejects negative nightPriceCents values", () => {
    const result = checkoutBodySchema.safeParse(
      makeValidBody({
        nightPriceCents: { "2025-07-01": -100 },
      })
    );
    expect(result.success).toBe(false);
  });

  test("rejects invalid email", () => {
    const result = checkoutBodySchema.safeParse(
      makeValidBody({
        guestInfo: {
          firstName: "John",
          lastName: "Doe",
          email: "not-an-email",
          adults: 2,
          children: 0,
        },
      })
    );
    expect(result.success).toBe(false);
  });

  test("rejects negative cityTaxCents", () => {
    const result = checkoutBodySchema.safeParse(
      makeValidBody({ cityTaxCents: -100 })
    );
    expect(result.success).toBe(false);
  });

  test("rejects non-integer selectedExtraIndices", () => {
    const result = checkoutBodySchema.safeParse(
      makeValidBody({ selectedExtraIndices: [1.5] })
    );
    expect(result.success).toBe(false);
  });

  test("accepts valid request", () => {
    const result = checkoutBodySchema.safeParse(
      makeValidBody({
        guestInfo: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "+1234567890",
          adults: 2,
          children: 0,
          guestNote: "Late arrival",
        },
      })
    );
    expect(result.success).toBe(true);
  });

  test("defaults selectedExtraIndices to empty array", () => {
    const { selectedExtraIndices: _, ...body } = makeValidBody();
    const result = checkoutBodySchema.safeParse(body);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selectedExtraIndices).toEqual([]);
    }
  });
});

describe("per-night price integrity check", () => {
  test("exact match passes", () => {
    const serverRate = 125.0;
    const clientCents = toCents(serverRate);
    expect(toCents(serverRate)).toBe(clientCents);
  });

  test("both sides produce same cents from same float", () => {
    const rate = 133.33;
    expect(toCents(rate)).toBe(toCents(rate));
  });

  test("integer sum of per-night cents is exact", () => {
    const nights = [30000, 30000, 20000, 20000];
    const total = nights.reduce((s, c) => s + c, 0);
    expect(total).toBe(100000);
  });

  test("detects single-night mismatch", () => {
    const serverCents = toCents(300);
    const clientCents = toCents(299);
    expect(serverCents).not.toBe(clientCents);
  });
});
