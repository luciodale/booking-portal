import { getAssetById, getPricingRulesByAssetId } from "@/data/helpers";
import { genUniqueId } from "@/modules/utils/id";
import {
  type BookingContext,
  calculatePriceBreakdown,
} from "@/modules/booking/domain/pricing";
import { createBookingSchema } from "@/modules/booking/domain/schema";
import { fromDateString } from "@/modules/utils/dates";
import type { APIRoute } from "astro";

export const bookingHandler: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // 1. Zod Validation (Shared Schema)
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Validation failed",
          errors: validation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { assetId, checkIn, checkOut, guests, currency, clientPrice } =
      validation.data;

    // 2. Fetch Source of Truth (Database/Mocks)
    const asset = getAssetById(assetId);
    if (!asset) {
      return new Response(
        JSON.stringify({ success: false, message: "Property not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Re-construct Booking Context (Server-Side)
    const pricingRules = getPricingRulesByAssetId(assetId);

    const context: BookingContext = {
      assetId: asset.id,
      pricingModel: "per_night",
      basePrice: asset.basePrice,
      cleaningFee: asset.cleaningFee ?? 0,
      currency: asset.currency,
      maxGuests: asset.maxGuests ?? 2,
      minNights: asset.minNights ?? 1,
      pricingRules,
    };

    // 4. Server-Side Price Calculation (The Security Gate)
    const startDate = fromDateString(checkIn);
    const endDate = fromDateString(checkOut);

    const serverBreakdown = calculatePriceBreakdown(
      startDate,
      endDate,
      guests,
      context
    );

    if (!serverBreakdown) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unable to calculate price",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Price Validation (Optional Tolerance)
    // We allow clientPrice to be passed just for comparison logging, usually we rely on server price
    if (clientPrice && Math.abs(clientPrice - serverBreakdown.total) > 100) {
      console.warn(
        `Price Mismatch! Client: ${clientPrice}, Server: ${serverBreakdown.total}`
      );
      // In strict mode, we might reject here. For now, we accept but use SERVER price.
    }

    // Simulate database write
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const bookingId = genUniqueId("BK");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reservation confirmed for ${asset.title}!`,
        bookingId,
        details: {
          propertyTitle: asset.title,
          checkIn,
          checkOut,
          guests,
          // ALWAYS return server-calculated totals
          total: serverBreakdown.total,
          currency: serverBreakdown.currency,
          breakdown: serverBreakdown,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Booking API Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error processing booking",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
