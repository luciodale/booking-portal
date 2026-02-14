import { getDb } from "@/db";
import { assets, pmsIntegrations } from "@/db/schema";
import { fetchApartmentById } from "@/features/broker/pms/integrations/smoobu/server-service/GETApartmentById";
import { fetchSmoobuRates } from "@/features/broker/pms/integrations/smoobu/server-service/GETRates";
import { checkSmoobuAvailability } from "@/features/broker/pms/integrations/smoobu/server-service/POSTCheckAvailability";
import { computeStayPrice } from "@/features/public/booking/domain/computeStayPrice";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing property ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await request.json()) as {
      arrivalDate?: string;
      departureDate?: string;
      guests?: number;
      currency?: string;
    };

    const { arrivalDate, departureDate, guests, currency } = body;
    if (!arrivalDate || !departureDate) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: arrivalDate, departureDate",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return new Response(JSON.stringify({ error: "Database not available" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb(D1Database);

    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!asset || !asset.smoobuPropertyId) {
      return new Response(
        JSON.stringify({ error: "Property not found or not linked to Smoobu" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const [integration] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.brokerId, asset.brokerId))
      .limit(1);

    if (!integration || integration.provider !== "smoobu") {
      return new Response(
        JSON.stringify({ error: "No Smoobu integration found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const customerId = integration.pmsUserId;
    if (!customerId) {
      return new Response(
        JSON.stringify({ error: "Smoobu user ID not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const smoobuPropertyId = asset.smoobuPropertyId;
    const propId = String(smoobuPropertyId);

    const availability = await checkSmoobuAvailability(integration.apiKey, {
      arrivalDate,
      departureDate,
      apartments: [smoobuPropertyId],
      customerId,
      guests,
    });

    // If apartment is available but Smoobu didn't return a price, compute from per-night rates
    const isAvailable =
      availability.availableApartments.includes(smoobuPropertyId);
    const hasSmoobuPrice = !!availability.prices[propId];

    if (isAvailable && !hasSmoobuPrice) {
      try {
        const [ratesResponse, apartment] = await Promise.all([
          fetchSmoobuRates(
            integration.apiKey,
            smoobuPropertyId,
            arrivalDate,
            departureDate
          ),
          fetchApartmentById(integration.apiKey, smoobuPropertyId),
        ]);
        const rateMap = ratesResponse.data[propId] ?? {};
        const computed = computeStayPrice(arrivalDate, departureDate, rateMap);

        if (computed.hasPricing) {
          availability.prices[propId] = {
            price: computed.total,
            currency: currency ?? apartment.currency,
          };
        }
      } catch (rateError) {
        console.error(
          "Failed to fetch rates for price computation:",
          rateError
        );
        // Non-fatal: availability still returned, just without computed price
      }
    }

    return new Response(JSON.stringify({ data: availability }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to check availability",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
