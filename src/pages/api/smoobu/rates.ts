/**
 * Smoobu Rates API Proxy
 * Proxies requests to get pricing rates from Smoobu
 */

import { SMOOBU_BASE_URL } from "@/constants";
import { getDb, pmcIntegrations } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

// ============================================================================
// Response Helpers
// ============================================================================

function jsonSuccess<T>(data: T): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 500): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message },
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// ============================================================================
// GET - Get rates for apartments
// ============================================================================

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    // Parse query params
    const apartments = url.searchParams.getAll("apartments[]");
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");

    if (!apartments.length || !startDate || !endDate) {
      return jsonError(
        "Missing required parameters: apartments[], start_date, end_date",
        400
      );
    }

    // TODO: Get actual broker ID from auth context
    const brokerId = "broker-001";

    // Get API key from integration
    const [integration] = await db
      .select()
      .from(pmcIntegrations)
      .where(eq(pmcIntegrations.brokerId, brokerId))
      .limit(1);

    if (!integration) {
      return jsonError("Smoobu integration not found", 404);
    }

    // Build Smoobu API URL
    const apartmentParams = apartments
      .map((id) => `apartments[]=${id}`)
      .join("&");
    const smoobuUrl = `${SMOOBU_BASE_URL}/api/rates?${apartmentParams}&start_date=${startDate}&end_date=${endDate}`;

    // Fetch rates from Smoobu
    const response = await fetch(smoobuUrl, {
      headers: {
        "Api-Key": integration.apiKey,
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as { detail?: string };
      return jsonError(
        error.detail || "Failed to fetch rates from Smoobu",
        response.status
      );
    }

    const data = await response.json();
    return jsonSuccess(data);
  } catch (error) {
    console.error("Error fetching Smoobu rates:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to fetch rates"
    );
  }
};
