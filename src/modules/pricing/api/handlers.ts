/**
 * Pricing Rules API Handlers
 * Extracted from pages/api/backoffice/pricing-rules.ts and pricing-rules/[id].ts
 */

import { getDb, pricingRules } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import {
  createPricingRuleSchema,
  updatePricingRuleSchema,
} from "@/modules/property/domain/schema";
import { genUniqueId } from "@/modules/utils/id";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

// ============================================================================
// Shared Response Helpers
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

// ============================================================================
// GET - List Pricing Rules for Asset
// ============================================================================

export const listPricingRules: APIRoute = async ({ url, locals }) => {
  try {
    await requireAdmin();

    const assetId = url.searchParams.get("assetId");
    if (!assetId) {
      return jsonError("assetId query parameter required", 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    const rules = await db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.assetId, assetId))
      .orderBy(pricingRules.startDate);

    return jsonSuccess({ pricingRules: rules });
  } catch (error) {
    console.error("Error fetching pricing rules:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to fetch pricing rules"
    );
  }
};

// ============================================================================
// POST - Create Pricing Rule
// ============================================================================

export const createPricingRule: APIRoute = async ({ request, locals }) => {
  try {
    await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    const body = await request.json();
    const validationResult = createPricingRuleSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError("Validation failed", 400, validationResult.error.issues);
    }

    const data = validationResult.data;

    const [created] = await db
      .insert(pricingRules)
      .values({
        id: genUniqueId(),
        assetId: data.assetId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        multiplier: data.multiplier,
        minNights: data.minNights ?? null,
        priority: data.priority ?? 0,
        active: true,
      })
      .returning();

    return jsonSuccess({ id: created.id });
  } catch (error) {
    console.error("Error creating pricing rule:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to create pricing rule"
    );
  }
};

// ============================================================================
// PATCH - Update Pricing Rule
// ============================================================================

export const updatePricingRule: APIRoute = async ({
  params,
  request,
  locals,
}) => {
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
        name: data.name ?? existing.name,
        startDate: data.startDate ?? existing.startDate,
        endDate: data.endDate ?? existing.endDate,
        multiplier: data.multiplier ?? existing.multiplier,
        minNights:
          data.minNights !== undefined ? data.minNights : existing.minNights,
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

export const deletePricingRule: APIRoute = async ({ params, locals }) => {
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
