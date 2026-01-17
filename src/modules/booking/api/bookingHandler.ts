import type { APIRoute } from "astro";
import { getAssetById, getPricingRulesByAssetId } from "../../../data/helpers";
import { fromISODateString } from "../../shared/utils/dates";
import {
  type BookingContext,
  calculatePriceBreakdown,
} from "../domain/pricing";
import { createBookingSchema } from "../domain/schema";

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
    const pricingModel = asset.type === "tour" ? "per_person" : "per_night";

    const context: BookingContext = {
      assetId: asset.id,
      assetType: asset.type,
      pricingModel,
      basePrice: asset.basePrice,
      cleaningFee: asset.cleaningFee ?? 0,
      currency: asset.currency,
      maxGuests: asset.maxGuests ?? 2,
      minNights: asset.minNights ?? 1,
      pricingRules,
    };

    // 4. Server-Side Price Calculation (The Security Gate)
    const startDate = fromISODateString(checkIn);
    const endDate = fromISODateString(checkOut);

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

    const bookingId = `BK-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

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
