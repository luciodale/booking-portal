import { getDb } from "@/db";
import { brokerFeeOverrides, users } from "@/db/schema";
import { requireAdmin } from "@/modules/auth/auth";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";

export async function GETBrokerFees(locals: APIContext["locals"]) {
  try {
    requireAdmin(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const db = getDb(D1Database);

    const rows = await db
      .select({
        userId: brokerFeeOverrides.userId,
        feePercent: brokerFeeOverrides.feePercent,
        email: users.email,
        name: users.name,
      })
      .from(brokerFeeOverrides)
      .innerJoin(users, eq(brokerFeeOverrides.userId, users.id));

    return jsonSuccess(rows);
  } catch (error) {
    console.error("[GETBrokerFees]", error);
    return jsonError("Internal error", mapErrorToStatus(error));
  }
}
