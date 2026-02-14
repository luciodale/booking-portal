import { getDb } from "@/db";
import { assets, pmsIntegrations } from "@/db/schema";
import { fetchSmoobuRates } from "@/features/broker/pms/integrations/smoobu/server-service/GETRates";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const smoobuPropertyId = url.searchParams.get("smoobuPropertyId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!smoobuPropertyId || !startDate || !endDate) {
      return jsonError(
        "Missing required parameters: smoobuPropertyId, startDate, endDate",
        400
      );
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.smoobuPropertyId, Number(smoobuPropertyId)))
      .limit(1);

    if (!asset) {
      return jsonError("No property found for this Smoobu property ID", 404);
    }

    const [integration] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.userId, asset.userId))
      .limit(1);

    if (!integration || integration.provider !== "smoobu") {
      return jsonError("No Smoobu integration found", 404);
    }

    const rates = await fetchSmoobuRates(
      integration.apiKey,
      Number(smoobuPropertyId),
      startDate,
      endDate
    );

    return jsonSuccess(rates);
  } catch (error) {
    console.error("Error fetching Smoobu rates:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to fetch rates"
    );
  }
};
