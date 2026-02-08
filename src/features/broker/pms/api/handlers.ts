/**
 * Backoffice integrations API: GET status, POST create (by provider).
 */

import { getDb, pmsIntegrations } from "@/db";
import { availablePms } from "@/features/broker/pms/constants/integrations";
import {
  insertIntegration,
  type TSmoobuCreateBodyInput,
} from "@/features/broker/pms/integrations/smoobu/insertIntegration";
import { requireAdmin } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

function jsonSuccess<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 500, details?: unknown): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message, details },
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export const GET: APIRoute = async ({ locals }) => {
  try {
    await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);
    const brokerId = "broker-001"; // TODO: from auth context

    const [integration] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.brokerId, brokerId))
      .limit(1);

    if (!integration) {
      return jsonSuccess({ hasIntegration: false, integration: null });
    }

    const { apiKey: _k, ...safeIntegration } = integration;
    return jsonSuccess({
      hasIntegration: true,
      integration: safeIntegration,
    });
  } catch (error) {
    console.error("Error checking integration:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to check integration"
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const body = (await request.json()) as { provider?: string };
    const provider = body?.provider;
    if (!provider || !(availablePms as readonly string[]).includes(provider)) {
      return jsonError(
        `Invalid or missing provider. Must be one of: ${availablePms.join(", ")}`,
        400
      );
    }

    const brokerId = "broker-001"; // TODO: from auth context

    switch (provider) {
      case "smoobu": {
        const integration = await insertIntegration(
          D1Database,
          brokerId,
          body as TSmoobuCreateBodyInput
        );
        return jsonSuccess(integration, 201);
      }
      default: {
        return jsonError(`Unhandled provider: ${provider}`, 400);
      }
    }
  } catch (error) {
    console.error("Error creating integration:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to create integration"
    );
  }
};
