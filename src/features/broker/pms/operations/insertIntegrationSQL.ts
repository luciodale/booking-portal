/**
 * Server-only: insert a PMS integration (provider-agnostic).
 * Validation is done by each integration (e.g. smoobu createBodySchema) before calling this.
 */

import { getDb } from "@/db";
import { type NewPmsIntegration, pmsIntegrations } from "@/db/schema";
import type { TPostIntegrationsResponse } from "@/features/broker/pms/api/types";
import { genUniqueId } from "@/modules/utils/id";
import type { D1Database } from "@cloudflare/workers-types";
import { eq } from "drizzle-orm";

type TPmsIntegrationCreateInput = Pick<
  NewPmsIntegration,
  "provider" | "apiKey" | "pmsUserId" | "pmsEmail"
>;

export async function insertIntegrationSQL(
  d1: D1Database,
  brokerId: string,
  data: TPmsIntegrationCreateInput
): Promise<TPostIntegrationsResponse> {
  const db = getDb(d1);
  const { provider, apiKey, pmsUserId, pmsEmail } = data;
  const now = new Date().toISOString();
  const id = genUniqueId("pms");

  try {
    await db.insert(pmsIntegrations).values({
      id,
      brokerId,
      provider,
      apiKey,
      pmsUserId: pmsUserId ?? null,
      pmsEmail: pmsEmail ?? null,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`PMS integration insert failed: ${message}`);
  }

  const [row] = await db
    .select()
    .from(pmsIntegrations)
    .where(eq(pmsIntegrations.id, id));
  if (!row) throw new Error("Insert succeeded but row not found");
  return {
    id: row.id,
    provider: row.provider,
    pmsUserId: row.pmsUserId,
    pmsEmail: row.pmsEmail,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
