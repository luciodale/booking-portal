import { getDb } from "@/db";
import { eventLogs } from "@/db/schema";
import {
  jsonError,
  jsonSuccess,
} from "@/features/broker/pms/api/server-handler/responseHelpers";
import { requireAdmin } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { and, desc, eq } from "drizzle-orm";

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    requireAdmin(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const db = getDb(D1Database);

    const level = url.searchParams.get("level") as
      | "info"
      | "warning"
      | "error"
      | null;
    const source = url.searchParams.get("source");
    const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 500);
    const offset = Number(url.searchParams.get("offset")) || 0;

    const conditions = [];
    if (level) conditions.push(eq(eventLogs.level, level));
    if (source) conditions.push(eq(eventLogs.source, source));

    const query = db
      .select()
      .from(eventLogs)
      .orderBy(desc(eventLogs.createdAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length === 1) {
      query.where(conditions[0]);
    } else if (conditions.length === 2) {
      query.where(and(conditions[0], conditions[1]));
    }

    const logs = await query;

    return jsonSuccess({ logs, limit, offset });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    if (
      error instanceof Error &&
      error.message === "Forbidden: Admin access required"
    ) {
      return jsonError("Forbidden", 403);
    }
    console.error("Error fetching event logs:", error);
    return jsonError("Failed to fetch event logs");
  }
};
