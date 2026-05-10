import { z } from "zod";

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
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    adults: z.number().int().min(1),
    children: z.number().int().min(0),
    guestNote: z.string().optional(),
  }),
  locale: z.string().optional(),
});
