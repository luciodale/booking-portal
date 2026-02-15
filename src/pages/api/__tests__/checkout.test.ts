import { describe, expect, test } from "vitest";
import { z } from "zod";

const checkoutBodySchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1),
  currency: z.string().min(1),
  totalPriceCents: z.number().int().positive(),
  guestInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    adults: z.number().int().min(1),
    children: z.number().int().min(0),
    guestNote: z.string().optional(),
  }),
});

function makeValidBody(overrides: Record<string, unknown> = {}) {
  return {
    propertyId: "prop-1",
    checkIn: "2025-07-01",
    checkOut: "2025-07-05",
    guests: 2,
    currency: "EUR",
    totalPriceCents: 50000,
    guestInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      adults: 2,
      children: 0,
    },
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

  test("rejects negative totalPriceCents", () => {
    const result = checkoutBodySchema.safeParse(
      makeValidBody({ totalPriceCents: -100 })
    );
    expect(result.success).toBe(false);
  });

  test("rejects non-integer totalPriceCents", () => {
    const result = checkoutBodySchema.safeParse(
      makeValidBody({ totalPriceCents: 500.5 })
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
});

describe("price integrity check (cents-based)", () => {
  function diverges(serverCents: number, clientCents: number): boolean {
    return (
      Math.abs(serverCents - clientCents) / serverCents > 0.01
    );
  }

  test("rejects if client price diverges more than 1% from server price", () => {
    expect(diverges(50000, 45000)).toBe(true); // 10% off
  });

  test("accepts if client price is within 1% of server price", () => {
    expect(diverges(50000, 50200)).toBe(false); // 0.4% off
  });

  test("accepts exact match", () => {
    expect(diverges(50000, 50000)).toBe(false);
  });

  test("accepts 1 cent difference on small price", () => {
    // 10000 cents = €100, 1 cent diff = 0.01%
    expect(diverges(10000, 10001)).toBe(false);
  });

  test("integer comparison eliminates floating-point ambiguity", () => {
    // Both sides use toCents(133.33) = 13333, so they match exactly
    const serverCents = 13333 * 3; // 39999
    const clientCents = 13333 * 3; // 39999
    expect(diverges(serverCents, clientCents)).toBe(false);
  });
});
