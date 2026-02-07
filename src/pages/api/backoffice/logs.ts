/**
 * Broker Logs API
 * Fetch and acknowledge broker logs/notifications
 */

import { brokerLogs, getDb } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { desc, eq } from "drizzle-orm";

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
// GET - Fetch broker logs (last 10)
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

    const logs = await db
      .select()
      .from(brokerLogs)
      .where(eq(brokerLogs.brokerId, brokerId))
      .orderBy(desc(brokerLogs.createdAt))
      .limit(10);

    return jsonSuccess({ logs });
  } catch (error) {
    console.error("Error fetching broker logs:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to fetch logs"
    );
  }
};

