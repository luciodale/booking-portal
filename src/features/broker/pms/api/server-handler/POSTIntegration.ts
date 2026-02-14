import { getDb } from "@/db";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import type {
  TPostIntegrationsRequest,
  TPostIntegrationsResponse,
} from "@/features/broker/pms/api/types";
import { availablePms } from "@/features/broker/pms/constants/integrations";
import { insertIntegration } from "@/features/broker/pms/integrations/smoobu/insertIntegration";
import { mapErrorToStatus } from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIRoute } from "astro";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    if (!ctx.userId) {
      return jsonError("Forbidden: No broker account", 403);
    }

    const body = (await request.json()) as { provider?: string };
    const provider = body?.provider;
    if (!provider || !(availablePms as readonly string[]).includes(provider)) {
      return jsonError(
        `Invalid or missing provider. Must be one of: ${availablePms.join(", ")}`,
        400
      );
    }

    switch (provider) {
      case "smoobu": {
        const integration = await insertIntegration(
          D1Database,
          ctx.userId,
          body as TPostIntegrationsRequest
        );
        return jsonSuccess(
          integration satisfies TPostIntegrationsResponse,
          201
        );
      }
      default: {
        return jsonError(`Unhandled provider: ${provider}`, 400);
      }
    }
  } catch (error) {
    console.error("Error creating integration:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to create integration",
      mapErrorToStatus(error)
    );
  }
};
