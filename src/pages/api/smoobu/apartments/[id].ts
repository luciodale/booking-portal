/**
 * Smoobu Apartment Details API Proxy
 * Proxies requests to get details for a specific apartment
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
// GET - Get apartment details
// ============================================================================

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    await requireAdmin();

    const { id } = params;
    if (!id) {
      return jsonError("Apartment ID required", 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

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

    // Fetch apartment details from Smoobu
    const response = await fetch(`${SMOOBU_BASE_URL}/api/apartments/${id}`, {
      headers: {
        "Api-Key": integration.apiKey,
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as { detail?: string };
      return jsonError(
        error.detail || "Failed to fetch apartment details from Smoobu",
        response.status
      );
    }

    const data = await response.json();
    return jsonSuccess(data);
  } catch (error) {
    console.error("Error fetching Smoobu apartment details:", error);
    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to fetch apartment details"
    );
  }
};
