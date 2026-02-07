/**
 * Smoobu Availability API Proxy
 * Checks apartment availability and returns pricing
 */

import { SMOOBU_BASE_URL } from "@/constants";
import { getDb, pmcIntegrations } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Schema Validation
// ============================================================================

const availabilityRequestSchema = z.object({
  arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  apartments: z.array(z.number()),
  customerId: z.number(),
  guests: z.number().optional(),
  discountCode: z.string().optional(),
});

// ============================================================================
// Response Helpers
// ============================================================================

function jsonSuccess<T>(data: T): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 500, details?: unknown): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message, details },
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// ============================================================================
// POST - Check availability
// ============================================================================

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    const body = await request.json();
    const validation = availabilityRequestSchema.safeParse(body);

    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.issues);
    }

    const requestData = validation.data;

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

    // Check availability with Smoobu
    const response = await fetch(
      `${SMOOBU_BASE_URL}/booking/checkApartmentAvailability`,
      {
        method: "POST",
        headers: {
          "Api-Key": integration.apiKey,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      const error = (await response.json()) as { detail?: string };
      return jsonError(
        error.detail || "Failed to check availability with Smoobu",
        response.status
      );
    }

    const data = await response.json();
    return jsonSuccess(data);
  } catch (error) {
    console.error("Error checking Smoobu availability:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to check availability"
    );
  }
};
