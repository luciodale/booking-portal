import { getDb } from "@/db";
import { assets, pmsIntegrations } from "@/db/schema";
import { checkSmoobuAvailability } from "@/features/broker/pms/integrations/smoobu/server-service/POSTCheckAvailability";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as {
      smoobuPropertyId?: number;
      arrivalDate?: string;
      departureDate?: string;
      guests?: number;
    };

    const { smoobuPropertyId, arrivalDate, departureDate, guests } = body;

    if (!smoobuPropertyId || !arrivalDate || !departureDate) {
      return jsonError(
        "Missing required fields: smoobuPropertyId, arrivalDate, departureDate",
        400
      );
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    // Find the asset by smoobuPropertyId to get the brokerId
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.smoobuPropertyId, smoobuPropertyId))
      .limit(1);

    if (!asset) {
      return jsonError("Property not found for this Smoobu ID", 404);
    }

    const [integration] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.brokerId, asset.brokerId))
      .limit(1);

    if (!integration || integration.provider !== "smoobu") {
      return jsonError("No Smoobu integration found", 404);
    }

    const customerId = integration.pmsUserId;
    if (!customerId) {
      return jsonError("Smoobu user ID not configured", 500);
    }

    const availability = await checkSmoobuAvailability(integration.apiKey, {
      arrivalDate,
      departureDate,
      apartments: [smoobuPropertyId],
      customerId,
      guests,
    });

    return jsonSuccess(availability);
  } catch (error) {
    console.error("Error checking Smoobu availability:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to check availability"
    );
  }
};
