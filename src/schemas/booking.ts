/**
 * Booking Validation Schemas
 * Single source of truth for client + server validation
 * Uses drizzle-zod to auto-generate from DB schema, extended with business logic
 */

import { bookings } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// Auto-generated schemas from Drizzle
// ============================================================================

/** Full booking schema inferred from DB */
export const bookingSelectSchema = createSelectSchema(bookings);

/** Insert schema inferred from DB */
const baseBookingInsertSchema = createInsertSchema(bookings);

// ============================================================================
// API Input Schemas (what clients send)
// ============================================================================

/**
 * Schema for creating a new booking via API.
 * Only includes fields the client should send, not auto-generated ones.
 */
export const createBookingSchema = baseBookingInsertSchema
  .pick({
    assetId: true,
    checkIn: true,
    checkOut: true,
    guests: true,
    currency: true,
    guestNote: true,
  })
  .extend({
    // Override with stricter constraints
    guests: z
      .number()
      .int()
      .min(1, "At least 1 guest required")
      .max(20, "Maximum 20 guests"),
    checkIn: z.string().date("Invalid check-in date format"),
    checkOut: z.string().date("Invalid check-out date format"),
    guestNote: z.string().max(1000).optional(),
    clientPrice: z.number().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.checkIn);
      const end = new Date(data.checkOut);
      return end > start;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["checkOut"],
    }
  );

/** Type for create booking input */
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ============================================================================
// Booking Context Schema (for store initialization)
// ============================================================================

/**
 * Schema for booking context passed from server to client
 * Properties use Smoobu for pricing; experiences use simple per-person pricing
 */
export const bookingContextSchema = z.object({
  assetId: z.string(),
  pricingModel: z.enum(["per_night", "per_person", "fixed"]),
  basePrice: z.number().int().min(0), // cents
  cleaningFee: z.number().int().min(0), // cents
  currency: z.string(),
  maxGuests: z.number().int().min(1),
  minNights: z.number().int().min(1),
});

export type BookingContextInput = z.infer<typeof bookingContextSchema>;
