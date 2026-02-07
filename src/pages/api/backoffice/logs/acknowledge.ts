/**
 * Acknowledge Broker Logs API
 * Mark logs as acknowledged
 */

import { brokerLogs, getDb } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Schema Validation
// ============================================================================

const acknowledgeSchema = z.object({
  logIds: z.array(z.string()).min(1),
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
// POST - Acknowledge logs
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
    const validation = acknowledgeSchema.safeParse(body);

    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.issues);
    }

    const { logIds } = validation.data;

    // TODO: Get actual broker ID from auth context
    const brokerId = "broker-001";

    // Update logs to acknowledged
    await db
      .update(brokerLogs)
      .set({ acknowledged: true })
      .where(
        // Only acknowledge logs belonging to this broker
        eq(brokerLogs.brokerId, brokerId) && inArray(brokerLogs.id, logIds)
      );

    return jsonSuccess({ acknowledgedCount: logIds.length });
  } catch (error) {
    console.error("Error acknowledging logs:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to acknowledge logs"
    );
  }
};

