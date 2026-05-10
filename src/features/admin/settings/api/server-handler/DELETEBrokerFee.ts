import { getDb } from "@/db";
import { brokerFeeOverrides } from "@/db/schema";
import { requireAdmin } from "@/modules/auth/auth";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";

export async function DELETEBrokerFee(
  request: Request,
  locals: APIContext["locals"]
) {
  try {
    requireAdmin(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return jsonError("userId query parameter is required", 400);
    }

    const db = getDb(D1Database);

    await db
      .delete(brokerFeeOverrides)
      .where(eq(brokerFeeOverrides.userId, userId));

    return jsonSuccess({ deleted: true });
  } catch (error) {
    console.error("[DELETEBrokerFee]", error);
    return jsonError("Internal error", mapErrorToStatus(error));
  }
}
