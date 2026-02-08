import type { TPostIntegrationsRequest, TPostIntegrationsResponse } from "@/features/broker/pms/api/types";
import { availablePms } from "@/features/broker/pms/constants/integrations";
import { insertIntegration } from "@/features/broker/pms/integrations/smoobu/insertIntegration";
import { requireAdmin } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { jsonError, jsonSuccess } from "./responseHelpers";

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
          body as TPostIntegrationsRequest
        );
        return jsonSuccess(integration satisfies TPostIntegrationsResponse, 201);
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
