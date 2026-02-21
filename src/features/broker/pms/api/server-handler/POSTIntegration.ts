import { getDb } from "@/db";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import type {
  TPostIntegrationsRequest,
  TPostIntegrationsResponse,
} from "@/features/broker/pms/api/types";
import { availablePms } from "@/features/broker/pms/constants/integrations";
import { insertIntegration } from "@/features/broker/pms/integrations/smoobu/insertIntegration";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import {
  mapErrorToStatus,
  safeErrorMessage,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIRoute } from "astro";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const POST: APIRoute = async ({ request, locals }) => {
  const locale = getRequestLocale(request);
  try {
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError(t(locale, "error.dbNotAvailable"), 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    if (!ctx.userId) {
      return jsonError(t(locale, "error.forbidden"), 403);
    }

    const body = (await request.json()) as { provider?: string };
    const provider = body?.provider;
    if (!provider || !(availablePms as readonly string[]).includes(provider)) {
      return jsonError(t(locale, "error.invalidRequest"), 400);
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
        return jsonError(t(locale, "error.invalidRequest"), 400);
      }
    }
  } catch (error) {
    console.error("Error creating integration:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to create integration", locale),
      mapErrorToStatus(error)
    );
  }
};
