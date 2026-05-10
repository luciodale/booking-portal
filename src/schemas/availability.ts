import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const availabilityBodySchema = z
  .object({
    arrivalDate: isoDate,
    departureDate: isoDate,
    guests: z.number().int().min(1).max(50).optional(),
  })
  .refine((v) => v.arrivalDate < v.departureDate, {
    message: "departureDate must be after arrivalDate",
    path: ["departureDate"],
  });

export const ratesQuerySchema = z
  .object({
    startDate: isoDate,
    endDate: isoDate,
  })
  .refine((v) => v.startDate <= v.endDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

// Smoobu apartment / customer IDs fit in a signed 32 bit int. Reject
// pathological values up front.
export const smoobuIntSchema = z.number().int().min(1).max(2_147_483_647);
