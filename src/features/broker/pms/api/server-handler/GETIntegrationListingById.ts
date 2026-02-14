import { getDb, pmsIntegrations } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { fetchApartmentById } from "@/features/broker/pms/integrations/smoobu/server-service/GETApartmentById";
import type { TGetIntegrationListingDetailResponse } from "@/features/broker/pms/api/types";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    await requireAdmin();

    const idParam = params?.id;
    const id = idParam ? Number(idParam) : Number.NaN;
    if (!Number.isInteger(id) || id < 1) {
      return jsonError("Invalid listing id", 400);
    }

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
      return jsonError("No Smoobu integration found", 404);
    }

    const detail = await fetchApartmentById(integration.apiKey, id);
    return jsonSuccess(detail satisfies TGetIntegrationListingDetailResponse);
  } catch (error) {
    console.error("Error fetching integration listing:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to fetch integration listing"
    );
  }
};
