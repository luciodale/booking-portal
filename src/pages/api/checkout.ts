import { getDb } from "@/db";
import { assets, pmsIntegrations } from "@/db/schema";
import { fetchSmoobuRates } from "@/features/broker/pms/integrations/smoobu/server-service/GETRates";
import { checkSmoobuAvailability } from "@/features/broker/pms/integrations/smoobu/server-service/POSTCheckAvailability";
import { computeStayPrice } from "@/features/public/booking/domain/computeStayPrice";
import { requireAuth } from "@/modules/auth/auth";
import { createEventLogger } from "@/modules/logging/eventLogger";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
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

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const authContext = requireAuth(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database)
      return jsonResponse({ error: "Database not available" }, 503);

    const stripeKey = locals.runtime?.env?.STRIPE_SECRET_KEY;
    if (!stripeKey)
      return jsonResponse({ error: "Stripe not configured" }, 503);

    const log = createEventLogger(D1Database);

    const body = checkoutBodySchema.safeParse(await request.json());
    if (!body.success) {
      return jsonResponse(
        { error: "Invalid request", details: body.error.issues },
        400
      );
    }

    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      currency,
      totalPrice,
      guestInfo,
    } = body.data;
    const db = getDb(D1Database);

    // Fetch asset + integration
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, propertyId))
      .limit(1);

    if (!asset || !asset.smoobuPropertyId) {
      return jsonResponse(
        { error: "Property not found or not linked to PMS" },
        404
      );
    }

    const [integration] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.userId, asset.userId))
      .limit(1);

    if (
      !integration ||
      integration.provider !== "smoobu" ||
      !integration.pmsUserId
    ) {
      return jsonResponse({ error: "No PMS integration found" }, 404);
    }

    // Re-verify availability server-side
    const availability = await checkSmoobuAvailability(integration.apiKey, {
      arrivalDate: checkIn,
      departureDate: checkOut,
      apartments: [asset.smoobuPropertyId],
      customerId: integration.pmsUserId,
      guests,
    });

    if (!availability.availableApartments.includes(asset.smoobuPropertyId)) {
      log.error({
        source: "checkout",
        message: `Availability conflict for property ${propertyId} (${checkIn} - ${checkOut})`,
        metadata: { propertyId, checkIn, checkOut, guests },
      });
      return jsonResponse(
        { error: "Property is no longer available for these dates" },
        409
      );
    }

    // Re-compute price server-side for integrity
    const propId = String(asset.smoobuPropertyId);
    let serverPrice: number;

    const smoobuPrice = availability.prices[propId];
    if (smoobuPrice) {
      serverPrice = smoobuPrice.price;
    } else {
      const ratesResponse = await fetchSmoobuRates(
        integration.apiKey,
        asset.smoobuPropertyId,
        checkIn,
        checkOut
      );
      const rateMap = ratesResponse.data[propId] ?? {};
      const computed = computeStayPrice(checkIn, checkOut, rateMap);
      if (!computed.hasPricing) {
        return jsonResponse(
          { error: "Unable to compute price for this stay" },
          400
        );
      }
      serverPrice = computed.total;
    }

    // Reject if client-submitted price diverges more than 1% from server price
    if (Math.abs(serverPrice - totalPrice) / serverPrice > 0.01) {
      log.error({
        source: "checkout",
        message: `Price mismatch for property ${propertyId}: client=${totalPrice}, server=${serverPrice}`,
        metadata: { propertyId, clientPrice: totalPrice, serverPrice },
      });
      return jsonResponse(
        { error: "Price has changed. Please refresh and try again." },
        409
      );
    }

    // Compute nights
    const checkInDate = new Date(`${checkIn}T00:00:00`);
    const checkOutDate = new Date(`${checkOut}T00:00:00`);
    const nights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const priceInCents = Math.round(serverPrice * 100);

    // Create Stripe Checkout Session (booking is created by webhook after payment)
    const stripe = new Stripe(stripeKey);

    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: guestInfo.email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: priceInCents,
            product_data: {
              name: asset.title,
              description: `${nights} night${nights !== 1 ? "s" : ""} · ${checkIn} to ${checkOut}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        propertyId,
        smoobuPropertyId: propId,
        clerkUserId: authContext.clerkUserId,
        checkIn,
        checkOut,
        nights: String(nights),
        guests: String(guests),
        currency: currency.toLowerCase(),
        totalPriceCents: String(priceInCents),
        guestNote: guestInfo.guestNote ?? "",
        guestFirstName: guestInfo.firstName,
        guestLastName: guestInfo.lastName,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone ?? "",
        adults: String(guestInfo.adults),
        children: String(guestInfo.children),
      },
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/elite/${propertyId}`,
    });

    log.info({
      source: "checkout",
      message: "Checkout session created",
      metadata: { propertyId, stripeSessionId: session.id },
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonResponse({ error: "Sign in required" }, 401);
    }
    const D1 = locals.runtime?.env?.DB;
    if (D1) {
      createEventLogger(D1).error({
        source: "checkout",
        message: `Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      500
    );
  }
};
