/**
 * Booking Handler - Integrated with Smoobu
 *
 * Flow:
 * 1. Validate booking request
 * 2. Check availability with Smoobu (server-side, don't trust client)
 * 3. Create Stripe checkout session with Smoobu price
 * 4. On payment success webhook: Create Smoobu reservation
 * 5. Log success/failure to brokerLogs
 */

import { SMOOBU_BASE_URL } from "@/constants";
import { assets, bookings, brokerLogs, getDb, pmcIntegrations } from "@/db";
import { genUniqueId } from "@/modules/utils/id";
import { createBookingSchema } from "@/schemas";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Extended Schema for Smoobu Booking
// ============================================================================

const smoobuBookingSchema = createBookingSchema.extend({
  smoobuPropertyId: z.number().int().positive(),
});

// ============================================================================
// Response Helpers
// ============================================================================

function jsonSuccess<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 500, details?: unknown): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message, details },
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// ============================================================================
// Booking Handler
// ============================================================================

export const bookingHandler: APIRoute = async ({ request, locals }) => {
  try {
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);
    const body = await request.json();

    // 1. Validate booking request
    const validation = smoobuBookingSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.issues);
    }

    const { assetId, checkIn, checkOut, guests, smoobuPropertyId } =
      validation.data;

    // 2. Fetch asset and verify it exists
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, assetId))
      .limit(1);

    if (!asset) {
      return jsonError("Property not found", 404);
    }

    // TODO: Get actual broker ID from auth context
    const brokerId = "broker-001";

    // 3. Get Smoobu integration
    const [integration] = await db
      .select()
      .from(pmcIntegrations)
      .where(eq(pmcIntegrations.brokerId, brokerId))
      .limit(1);

    if (!integration) {
      return jsonError("Smoobu integration not found", 404);
    }

    // 4. Check availability with Smoobu (SERVER-SIDE - don't trust client)
    const availabilityResponse = await fetch(
      `${SMOOBU_BASE_URL}/booking/checkApartmentAvailability`,
      {
        method: "POST",
        headers: {
          "Api-Key": integration.apiKey,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          arrivalDate: checkIn,
          departureDate: checkOut,
          apartments: [smoobuPropertyId],
          customerId: integration.smoobuUserId,
          guests,
        }),
      }
    );

    if (!availabilityResponse.ok) {
      return jsonError("Failed to check availability with Smoobu", 500);
    }

    const availabilityData = (await availabilityResponse.json()) as {
      availableApartments?: number[];
      prices?: Record<number, { price: number; currency: string }>;
      errorMessages?: Record<
        number,
        {
          errorCode: number;
          message: string;
          minimumLengthOfStay?: number;
        }
      >;
    };

    // Check if property is available
    if (
      !availabilityData.availableApartments?.includes(smoobuPropertyId) ||
      !availabilityData.prices?.[smoobuPropertyId]
    ) {
      // Log unavailability
      await db.insert(brokerLogs).values({
        id: genUniqueId("log"),
        brokerId,
        eventType: "smoobu_booking_failure",
        relatedEntityId: assetId,
        message: "Property not available for selected dates",
        metadata: {
          checkIn,
          checkOut,
          guests,
          smoobuPropertyId,
          errorMessages: availabilityData.errorMessages,
        },
        acknowledged: false,
        createdAt: new Date().toISOString(),
      });

      return jsonError(
        "Property not available for selected dates",
        400,
        availabilityData.errorMessages?.[smoobuPropertyId]
      );
    }

    // Get price from Smoobu
    const smoobuPrice = availabilityData.prices[smoobuPropertyId];
    const totalPrice = Math.round(smoobuPrice.price * 100); // Convert to cents
    const currency = smoobuPrice.currency.toLowerCase();

    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 5. TODO: Create Stripe Checkout Session
    // For now, simulate booking creation

    const bookingId = genUniqueId("booking");

    // 6. Create booking in database (pending payment)
    await db.insert(bookings).values({
      id: bookingId,
      assetId,
      userId: "user-001", // TODO: Get from auth
      checkIn,
      checkOut,
      nights,
      guests,
      baseTotal: totalPrice,
      cleaningFee: 0,
      serviceFee: 0,
      totalPrice,
      currency,
      status: "pending",
      smoobuReservationId: null, // Will be set after Smoobu reservation created
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 7. TODO: On payment success webhook, create Smoobu reservation
    // This would be in a separate webhook handler

    // Log successful booking initiation
    await db.insert(brokerLogs).values({
      id: genUniqueId("log"),
      brokerId,
      eventType: "smoobu_booking_success",
      relatedEntityId: bookingId,
      message: "Booking initiated successfully",
      metadata: {
        bookingId,
        assetId,
        smoobuPropertyId,
        checkIn,
        checkOut,
        totalPrice,
        currency,
      },
      acknowledged: false,
      createdAt: new Date().toISOString(),
    });

    return jsonSuccess({
      bookingId,
      message: "Booking initiated successfully",
      details: {
        propertyTitle: asset.title,
        checkIn,
        checkOut,
        guests,
        nights,
        totalPrice,
        currency,
      },
    });
  } catch (error) {
    console.error("Booking API Error:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to process booking"
    );
  }
};
