/**
 * Pricing Rules API
 * GET /api/backoffice/pricing-rules?assetId=X - List pricing rules for asset
 * POST /api/backoffice/pricing-rules - Create new pricing rule
 */

import { getDb, pricingRules } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { createPricingRuleSchema } from "@/modules/backoffice/domain/elite-schema";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const prerender = false;

// ============================================================================
// GET - List Pricing Rules for Asset
// ============================================================================

export const GET: APIRoute = async ({ url, locals }) => {
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

export const POST: APIRoute = async ({ request, locals }) => {
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
        id: nanoid(),
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
