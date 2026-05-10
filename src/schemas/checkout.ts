import { z } from "zod";

// Client supplied per attempt nonce. Used as the Stripe idempotency key suffix
// so retries from the same submit collapse to one session, but distinct user
// initiated attempts always produce fresh sessions.
const requestNonceSchema = z
  .string()
  .min(8)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, "invalid characters");

export const checkoutBodySchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1),
  currency: z.string().min(1),
  nightPriceCents: z.record(z.string(), z.number().int().nonnegative()),
  cityTaxCents: z.number().int().nonnegative(),
  selectedExtraIndices: z.array(z.number().int().min(0)).default([]),
  guestInfo: z.object({
    firstName: z.string().min(1).max(120),
    lastName: z.string().min(1).max(120),
    email: z.string().email().max(320),
    phone: z.string().max(40).optional(),
    adults: z.number().int().min(1),
    children: z.number().int().min(0),
    guestNote: z.string().max(2000).optional(),
  }),
  locale: z.string().optional(),
  requestNonce: requestNonceSchema,
});
