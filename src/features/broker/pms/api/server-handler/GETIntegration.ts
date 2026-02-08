import { getDb, pmsIntegrations } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import type { TGetIntegrationsResponse } from "../types";
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
      error instanceof Error ? error.message : "Failed to check integration"
    );
  }
};
