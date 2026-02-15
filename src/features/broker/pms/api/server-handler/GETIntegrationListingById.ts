import { getDb } from "@/db";
import { pmsIntegrations } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import type { TGetIntegrationListingDetailResponse } from "@/features/broker/pms/api/types";
import { fetchApartmentById } from "@/features/broker/pms/integrations/smoobu/server-service/GETApartmentById";
import {
  mapErrorToStatus,
  safeErrorMessage,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const GET: APIRoute = async ({ params, locals }) => {
  try {
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
    const ctx = await resolveBrokerContext(locals, db);

    if (!ctx.userId) {
      return jsonError("Forbidden: No broker account", 403);
    }

    const [integration] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.userId, ctx.userId))
      .limit(1);

    if (!integration || integration.provider !== "smoobu") {
      return jsonError("No Smoobu integration found", 404);
    }

    const detail = await fetchApartmentById(integration.apiKey, id);
    return jsonSuccess(detail satisfies TGetIntegrationListingDetailResponse);
  } catch (error) {
    console.error("Error fetching integration listing:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to fetch integration listing"),
      mapErrorToStatus(error)
    );
  }
};
