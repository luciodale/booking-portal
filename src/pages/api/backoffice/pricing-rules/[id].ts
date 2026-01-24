/**
 * Pricing Rules API - Single Rule Operations
 * DELETE /api/backoffice/pricing-rules/:id - Delete pricing rule
 */

import { getDb, pricingRules } from "@/db";
import { requireAdmin } from "@/lib/auth";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

export const prerender = false;

// ============================================================================
// DELETE - Delete Pricing Rule
// ============================================================================

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    await requireAdmin();

    const { id } = params;
    if (!id) {
      return jsonError("Pricing rule ID required", 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    // Check if pricing rule exists
    const [existing] = await db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Pricing rule not found", 404);
    }

    await db.delete(pricingRules).where(eq(pricingRules.id, id));

    return jsonSuccess({ message: "Pricing rule deleted successfully" });
  } catch (error) {
    console.error("Error deleting pricing rule:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to delete pricing rule"
    );
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

function jsonSuccess<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
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

