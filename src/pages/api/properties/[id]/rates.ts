import { assets, getDb, pmsIntegrations } from "@/db";
import { fetchSmoobuRates } from "@/features/broker/pms/integrations/smoobu/server-service/GETRates";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

export const GET: APIRoute = async ({ params, locals, url }) => {
  try {
    const { id } = params;
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!id || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: "Missing required params: id, startDate, endDate" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return new Response(
        JSON.stringify({ error: "Database not available" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
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

    const rates = await fetchSmoobuRates(
      integration.apiKey,
      asset.smoobuPropertyId,
      startDate,
      endDate
    );

    return new Response(JSON.stringify({ data: rates }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching rates:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to fetch rates",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
