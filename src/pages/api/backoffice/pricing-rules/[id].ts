/**
 * Pricing Rules API - Single Rule Operations
 * PATCH /api/backoffice/pricing-rules/:id - Update pricing rule
 * DELETE /api/backoffice/pricing-rules/:id - Delete pricing rule
 */

import { getDb, pricingRules } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { updatePricingRuleSchema } from "@/modules/backoffice/domain/elite-schema";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

export const prerender = false;

// ============================================================================
// PATCH - Update Pricing Rule
// ============================================================================

export const PATCH: APIRoute = async ({ params, request, locals }) => {
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

    const body = await request.json();
    const validationResult = updatePricingRuleSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError("Validation failed", 400, validationResult.error.issues);
    }

    const data = validationResult.data;

    const [updated] = await db
      .update(pricingRules)
      .set({
        ...data,
        // Convert undefined to existing values (partial update)
        name: data.name ?? existing.name,
        startDate: data.startDate ?? existing.startDate,
        endDate: data.endDate ?? existing.endDate,
        multiplier: data.multiplier ?? existing.multiplier,
        minNights: data.minNights !== undefined ? data.minNights : existing.minNights,
        priority: data.priority ?? existing.priority,
      })
      .where(eq(pricingRules.id, id))
      .returning();

    return jsonSuccess(updated);
  } catch (error) {
    console.error("Error updating pricing rule:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to update pricing rule"
    );
  }
};

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

