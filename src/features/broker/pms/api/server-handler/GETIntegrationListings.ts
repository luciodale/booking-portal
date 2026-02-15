import { getDb } from "@/db";
import { assets, pmsIntegrations } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import type { TGetIntegrationListingsResponse } from "@/features/broker/pms/api/types";
import { fetchListApartments } from "@/features/broker/pms/integrations/smoobu/server-service/GETListApartments";
import {
  mapErrorToStatus,
  safeErrorMessage,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIRoute } from "astro";
import { eq, isNotNull } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const GET: APIRoute = async ({ locals }) => {
  try {
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
      return jsonSuccess({
        listings: [],
      } satisfies TGetIntegrationListingsResponse);
    }

    const [data, existingProperties] = await Promise.all([
      fetchListApartments(integration.apiKey),
      db
        .select({ smoobuPropertyId: assets.smoobuPropertyId })
        .from(assets)
        .where(isNotNull(assets.smoobuPropertyId)),
    ]);

    const importedIds = new Set(
      existingProperties.map((p) => p.smoobuPropertyId)
    );

    const response: TGetIntegrationListingsResponse = {
      listings: data.apartments
        .filter((a) => !importedIds.has(a.id))
        .map((a) => ({ id: a.id, name: a.name })),
    };
    return jsonSuccess(response);
  } catch (error) {
    console.error("Error listing integration properties:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to list integration properties"),
      mapErrorToStatus(error)
    );
  }
};
