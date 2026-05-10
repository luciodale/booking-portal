import { z } from "zod";

const intString = z
  .string()
  .regex(/^\d+$/, "expected non negative integer")
  .transform((v) => Number(v))
  .refine((n) => Number.isFinite(n));

const optionalIntString = z
  .string()
  .optional()
  .transform((v) => (v == null || v === "" ? undefined : Number(v)))
  .refine((n) => n === undefined || Number.isFinite(n));

export const propertyBookingMetaSchema = z.object({
  type: z.literal("property").optional(),
  propertyId: z.string().min(1),
  smoobuPropertyId: z.string().min(1).optional(),
  userId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nights: intString,
  guests: intString,
  currency: z.string().min(1),
  totalPriceCents: intString,
  nightlyTotalCents: intString,
  additionalCostsCents: intString,
  extrasCents: intString,
  cityTaxCents: intString,
  platformFeeCents: intString,
  withholdingTaxCents: intString,
  applicationFeeCents: intString,
  guestNote: z.string().optional(),
  guestFirstName: z.string().min(1),
  guestLastName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  adults: optionalIntString,
  children: optionalIntString,
});

export type PropertyBookingMeta = z.infer<typeof propertyBookingMetaSchema>;

export const experienceBookingMetaSchema = z.object({
  type: z.literal("experience"),
  experienceId: z.string().min(1),
  userId: z.string().min(1),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  participants: intString,
  totalPriceCents: intString,
  currency: z.string().min(1),
  guestFirstName: z.string().optional(),
  guestLastName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  guestNote: z.string().optional(),
});

export type ExperienceBookingMeta = z.infer<typeof experienceBookingMetaSchema>;
