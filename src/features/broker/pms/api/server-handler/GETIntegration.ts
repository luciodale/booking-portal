import { getDb } from "@/db";
import { pmsIntegrations } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import {
  mapErrorToStatus,
  safeErrorMessage,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import type { TGetIntegrationsResponse } from "../types";
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

    if (!integration) {
      return jsonSuccess({ hasIntegration: false, integration: null });
    }

    const { apiKey: _k, ...safeIntegration } = integration;
    return jsonSuccess({
      hasIntegration: true,
      integration: safeIntegration,
    } satisfies TGetIntegrationsResponse);
  } catch (error) {
    console.error("Error checking integration:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to check integration"),
      mapErrorToStatus(error)
    );
  }
};
