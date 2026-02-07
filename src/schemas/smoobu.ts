/**
 * Smoobu API Schemas
 * Zod schemas for Smoobu API types with runtime validation
 * Based on Smoobu API documentation
 */

import { z } from "zod";

// ============================================================================
// User / Authentication
// ============================================================================

export const verifyApiKeyRequestSchema = z.object({
  apiKey: z.string().min(1),
});

export type SmoobuApiKeyVerificationRequest = z.infer<
  typeof verifyApiKeyRequestSchema
>;

export const smoobuUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().optional(),
});

export type SmoobuUser = z.infer<typeof smoobuUserSchema>;

export type SmoobuApiKeyVerificationResponse = SmoobuUser;

export const smoobuErrorResponseSchema = z.object({
  status: z.number(),
  title: z.string(),
  detail: z.string(),
});

export type SmoobuErrorResponse = z.infer<typeof smoobuErrorResponseSchema>;

// ============================================================================
// Apartments / Properties
// ============================================================================

export const smoobuApartmentListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const smoobuApartmentDetailsSchema = z.object({
  location: z.object({
    street: z.string(),
    zip: z.string(),
    city: z.string(),
    country: z.string(),
    latitude: z.string(),
    longitude: z.string(),
  }),
  timeZone: z.string(),
  rooms: z.object({
    maxOccupancy: z.number(),
    bedrooms: z.number(),
    bathrooms: z.number(),
    doubleBeds: z.number().nullable(),
    singleBeds: z.number().nullable(),
    sofaBeds: z.number().nullable(),
    couches: z.number().nullable(),
    childBeds: z.number().nullable(),
    queenSizeBeds: z.number().nullable(),
    kingSizeBeds: z.number().nullable(),
  }),
  equipments: z.array(z.string()), // amenities
  currency: z.string(),
  price: z.object({
    minimal: z.string(),
    maximal: z.string(),
  }),
  type: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export const smoobuApartmentsResponseSchema = z.object({
  apartments: z.array(smoobuApartmentListItemSchema),
});

export type SmoobuApartmentListItem = z.infer<
  typeof smoobuApartmentListItemSchema
>;
export type SmoobuApartmentDetails = z.infer<
  typeof smoobuApartmentDetailsSchema
>;
export type SmoobuApartmentsResponse = z.infer<
  typeof smoobuApartmentsResponseSchema
>;

// ============================================================================
// Rates / Pricing
// ============================================================================

export const smoobuRateDaySchema = z.object({
  price: z.number().nullable(),
  min_length_of_stay: z.number().nullable(),
  available: z.union([z.literal(0), z.literal(1)]),
});

export const smoobuRatesResponseSchema = z.object({
  data: z.record(
    z.string(), // apartmentId
    z.record(
      z.string(), // date (YYYY-MM-DD)
      smoobuRateDaySchema
    )
  ),
});

export type SmoobuRateDay = z.infer<typeof smoobuRateDaySchema>;
export type SmoobuRatesResponse = z.infer<typeof smoobuRatesResponseSchema>;

// ============================================================================
// Availability
// ============================================================================

export const smoobuAvailabilityRequestSchema = z.object({
  arrivalDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  apartments: z.array(z.number()),
  customerId: z.number(),
  guests: z.number().optional(),
  discountCode: z.string().optional(),
});

export const smoobuAvailabilityResponseSchema = z.object({
  availableApartments: z.array(z.number()),
  prices: z.record(
    z.string(), // apartmentId
    z.object({
      price: z.number(),
      currency: z.string(),
    })
  ),
  errorMessages: z.record(
    z.string(), // apartmentId
    z.object({
      errorCode: z.number(),
      message: z.string(),
      minimumLengthOfStay: z.number().optional(),
      numberOfGuest: z.number().optional(),
      leadTime: z.number().optional(),
      minimumLengthBetweenBookings: z.number().optional(),
      arrivalDays: z.array(z.string()).optional(),
    })
  ),
});

export type SmoobuAvailabilityRequest = z.infer<
  typeof smoobuAvailabilityRequestSchema
>;
export type SmoobuAvailabilityResponse = z.infer<
  typeof smoobuAvailabilityResponseSchema
>;

// ============================================================================
// Bookings / Reservations
// ============================================================================

export const smoobuPriceElementSchema = z.object({
  type: z.string(),
  name: z.string(),
  amount: z.number(),
  quantity: z.number().nullable(),
  tax: z.number().nullable(),
  currencyCode: z.string(),
  sortOrder: z.number(),
});

export const smoobuCreateBookingRequestSchema = z.object({
  arrivalDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  channelId: z.number(),
  apartmentId: z.number(),
  arrivalTime: z.string().optional(),
  departureTime: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notice: z.string().optional(),
  adults: z.number().optional(),
  children: z.number().optional(),
  price: z.number().optional(),
  priceStatus: z.number().optional(),
  deposit: z.number().optional(),
  depositStatus: z.number().optional(),
  language: z.string().optional(),
  priceElements: z.array(smoobuPriceElementSchema).optional(),
});

export const smoobuCreateBookingResponseSchema = z.object({
  id: z.number(),
});

export type SmoobuCreateBookingRequest = z.infer<
  typeof smoobuCreateBookingRequestSchema
>;
export type SmoobuCreateBookingResponse = z.infer<
  typeof smoobuCreateBookingResponseSchema
>;
