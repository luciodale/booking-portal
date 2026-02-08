/**
 * Server-only: insert a PMS integration (provider-agnostic).
 * Validation is done by each integration (e.g. smoobu createBodySchema) before calling this.
 */

import { getDb, pmsIntegrations, type NewPmsIntegration } from "@/db";
import type { TPostIntegrationsResponse } from "@/features/broker/pms/api/types";
import { genUniqueId } from "@/modules/utils/id";
import type { D1Database } from "@cloudflare/workers-types";

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

  const [row] = await db
    .insert(pmsIntegrations)
    .values({
      id: genUniqueId("pms"),
      brokerId,
      provider,
      apiKey,
      pmsUserId: pmsUserId ?? null,
      pmsEmail: pmsEmail ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  if (!row) throw new Error("Insert failed");
  return {
    id: row.id,
    provider: row.provider,
    pmsUserId: row.pmsUserId,
    pmsEmail: row.pmsEmail,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
