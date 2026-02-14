import { getDb, pmsIntegrations } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { fetchListApartments } from "@/features/broker/pms/integrations/smoobu/server-service/GETListApartments";
import type { TGetIntegrationListingsResponse } from "@/features/broker/pms/api/types";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const GET: APIRoute = async ({ locals }) => {
  try {
    await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);
    const brokerId = "broker-001"; // TODO: from auth context

    const [integration] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.brokerId, brokerId))
      .limit(1);

    if (!integration || integration.provider !== "smoobu") {
      return jsonSuccess({ listings: [] } satisfies TGetIntegrationListingsResponse);
    }

    const data = await fetchListApartments(integration.apiKey);
    const response: TGetIntegrationListingsResponse = {
      listings: data.apartments.map((a) => ({ id: a.id, name: a.name })),
    };
    return jsonSuccess(response);
  } catch (error) {
    console.error("Error listing integration properties:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to list integration properties"
    );
  }
};
