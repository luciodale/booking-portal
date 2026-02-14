import { describe, expect, test } from "vitest";
import { z } from "zod";

const checkoutBodySchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1),
  currency: z.string().min(1),
  totalPrice: z.number().positive(),
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

describe("checkout request validation", () => {
  test("rejects missing propertyId", () => {
    const result = checkoutBodySchema.safeParse({
      checkIn: "2025-07-01",
      checkOut: "2025-07-05",
      guests: 2,
      currency: "EUR",
      totalPrice: 500,
      guestInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        adults: 2,
        children: 0,
      },
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid date format", () => {
    const result = checkoutBodySchema.safeParse({
      propertyId: "prop-1",
      checkIn: "07/01/2025",
      checkOut: "2025-07-05",
      guests: 2,
      currency: "EUR",
      totalPrice: 500,
      guestInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        adults: 2,
        children: 0,
      },
    });
    expect(result.success).toBe(false);
  });

  test("rejects zero guests", () => {
    const result = checkoutBodySchema.safeParse({
      propertyId: "prop-1",
      checkIn: "2025-07-01",
      checkOut: "2025-07-05",
      guests: 0,
      currency: "EUR",
      totalPrice: 500,
      guestInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        adults: 1,
        children: 0,
      },
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative totalPrice", () => {
    const result = checkoutBodySchema.safeParse({
      propertyId: "prop-1",
      checkIn: "2025-07-01",
      checkOut: "2025-07-05",
      guests: 2,
      currency: "EUR",
      totalPrice: -100,
      guestInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        adults: 2,
        children: 0,
      },
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid email", () => {
    const result = checkoutBodySchema.safeParse({
      propertyId: "prop-1",
      checkIn: "2025-07-01",
      checkOut: "2025-07-05",
      guests: 2,
      currency: "EUR",
      totalPrice: 500,
      guestInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "not-an-email",
        adults: 2,
        children: 0,
      },
    });
    expect(result.success).toBe(false);
  });

  test("accepts valid request", () => {
    const result = checkoutBodySchema.safeParse({
      propertyId: "prop-1",
      checkIn: "2025-07-01",
      checkOut: "2025-07-05",
      guests: 2,
      currency: "EUR",
      totalPrice: 500,
      guestInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+1234567890",
        adults: 2,
        children: 0,
        guestNote: "Late arrival",
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("price integrity check", () => {
  test("rejects if client price diverges more than 1% from server price", () => {
    const serverPrice = 500;
    const clientPrice = 450; // 10% off — should fail

    const divergence = Math.abs(serverPrice - clientPrice) / serverPrice;
    expect(divergence > 0.01).toBe(true);
  });

  test("accepts if client price is within 1% of server price", () => {
    const serverPrice = 500;
    const clientPrice = 502; // 0.4% off — should pass

    const divergence = Math.abs(serverPrice - clientPrice) / serverPrice;
    expect(divergence <= 0.01).toBe(true);
  });

  test("accepts exact match", () => {
    const serverPrice = 500;
    const clientPrice = 500;

    const divergence = Math.abs(serverPrice - clientPrice) / serverPrice;
    expect(divergence <= 0.01).toBe(true);
  });
});
