import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/modules/auth/auth";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIContext } from "astro";
import { isNotNull } from "drizzle-orm";

export async function GETBrokers(locals: APIContext["locals"]) {
  try {
    requireAdmin(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const db = getDb(D1Database);

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(isNotNull(users.stripeConnectedAccountId));

    return jsonSuccess(rows);
  } catch (error) {
    console.error("[GETBrokers]", error);
    return jsonError("Internal error", mapErrorToStatus(error));
  }
}
