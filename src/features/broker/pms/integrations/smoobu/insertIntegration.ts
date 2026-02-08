/**
 * Server-only: create Smoobu PMS integration.
 * Validates body with smoobu schema then delegates to shared operation.
 */

import { insertIntegrationSQL } from "@/features/broker/pms/operations/insertIntegrationSQL";
import type { D1Database } from "@cloudflare/workers-types";
import {
  type TSmoobuCreateBodyInput,
  smoobuCreateBodySchema,
} from "./createBodySchema";

export type { TSmoobuCreateBodyInput };

export async function insertIntegration(
  d1: D1Database,
  brokerId: string,
  body: TSmoobuCreateBodyInput
) {
  const validation = smoobuCreateBodySchema.safeParse(body);
  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.error.issues.map((i) => i.message).join(", ")}`
    );
  }
  const { provider, apiKey, pmsUserId, pmsEmail } = validation.data;
  return insertIntegrationSQL(d1, brokerId, {
    provider,
    apiKey,
    pmsUserId,
    pmsEmail,
  });
}
