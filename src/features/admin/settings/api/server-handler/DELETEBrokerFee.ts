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
import { z } from "zod";

const deleteBrokerFeeSchema = z.object({
  userId: z.string().min(1),
});

export async function DELETEBrokerFee(
  request: Request,
  locals: APIContext["locals"]
) {
  try {
    requireAdmin(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const body = deleteBrokerFeeSchema.safeParse(await request.json());
    if (!body.success) {
      return jsonError("Invalid request", 400, body.error.issues);
    }

    const { userId } = body.data;
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
