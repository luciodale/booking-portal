import { getDb } from "@/db";
import { brokerFeeOverrides } from "@/db/schema";
import { requireAdmin } from "@/modules/auth/auth";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIContext } from "astro";
import { nanoid } from "nanoid";
import { z } from "zod";

const putBrokerFeeSchema = z.object({
  userId: z.string().min(1),
  feePercent: z.number().int().min(0).max(100),
});

export async function PUTBrokerFee(
  request: Request,
  locals: APIContext["locals"]
) {
  try {
    requireAdmin(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const body = putBrokerFeeSchema.safeParse(await request.json());
    if (!body.success) {
      return jsonError("Invalid request", 400, body.error.issues);
    }

    const { userId, feePercent } = body.data;
    const db = getDb(D1Database);
    const now = new Date().toISOString();

    await db
      .insert(brokerFeeOverrides)
      .values({
        id: nanoid(),
        userId,
        feePercent,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: brokerFeeOverrides.userId,
        set: { feePercent, updatedAt: now },
      });

    return jsonSuccess({ userId, feePercent });
  } catch (error) {
    console.error("[PUTBrokerFee]", error);
    return jsonError("Internal error", mapErrorToStatus(error));
  }
}
