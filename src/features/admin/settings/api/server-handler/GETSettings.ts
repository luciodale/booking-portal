import { getDb } from "@/db";
import { platformSettings } from "@/db/schema";
import { requireAdmin } from "@/modules/auth/auth";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIContext } from "astro";

export async function GETSettings(locals: APIContext["locals"]) {
  try {
    requireAdmin(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const db = getDb(D1Database);
    const rows = await db.select().from(platformSettings);

    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return jsonSuccess(settings);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Internal error",
      mapErrorToStatus(error)
    );
  }
}
