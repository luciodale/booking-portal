import { getDb, pmcIntegrations } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import { genUniqueId } from "@/modules/utils/id";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Schema Validation
// ============================================================================

const createIntegrationSchema = z.object({
  provider: z.literal("smoobu"),
  apiKey: z.string().min(1),
  smoobuUserId: z.number().optional(),
  smoobuEmail: z.string().email().optional(),
});

// ============================================================================
// Response Helpers
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
// GET - Check Integration Status
// ============================================================================

export const GET: APIRoute = async ({ locals }) => {
  try {
    await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    // TODO: Get actual broker ID from auth context
    const brokerId = "broker-001";

    const [integration] = await db
      .select()
      .from(pmcIntegrations)
      .where(eq(pmcIntegrations.brokerId, brokerId))
      .limit(1);

    if (!integration) {
      return jsonSuccess({ hasIntegration: false, integration: null });
    }

    // Don't send API key to client
    const { apiKey, ...safeIntegration } = integration;

    return jsonSuccess({
      hasIntegration: true,
      integration: safeIntegration,
    });
  } catch (error) {
    console.error("Error checking integration:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to check integration"
    );
  }
};

// ============================================================================
// POST - Create/Update Integration
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
    const validation = createIntegrationSchema.safeParse(body);

    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.issues);
    }

    const { provider, apiKey, smoobuUserId, smoobuEmail } = validation.data;

    // TODO: Get actual broker ID from auth context
    const brokerId = "broker-001";

    // Check if integration already exists
    const [existing] = await db
      .select()
      .from(pmcIntegrations)
      .where(eq(pmcIntegrations.brokerId, brokerId))
      .limit(1);

    let integration;

    if (existing) {
      // Update existing
      [integration] = await db
        .update(pmcIntegrations)
        .set({
          provider,
          apiKey,
          smoobuUserId,
          smoobuEmail,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(pmcIntegrations.id, existing.id))
        .returning();
    } else {
      // Create new
      [integration] = await db
        .insert(pmcIntegrations)
        .values({
          id: genUniqueId("pmc"),
          brokerId,
          provider,
          apiKey,
          smoobuUserId,
          smoobuEmail,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();
    }

    // Don't send API key to client
    const { apiKey: _, ...safeIntegration } = integration;

    return jsonSuccess(safeIntegration, 201);
  } catch (error) {
    console.error("Error creating integration:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to create integration"
    );
  }
};

