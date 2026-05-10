import { getDb } from "@/db";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import type { TPostIntegrationsResponse } from "@/features/broker/pms/api/types";
import { smoobuCreateBodySchema } from "@/features/broker/pms/integrations/smoobu/createBodySchema";
import { insertIntegration } from "@/features/broker/pms/integrations/smoobu/insertIntegration";
import {
  mapErrorToStatus,
  safeErrorMessage,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
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

    const raw = await request.json();
    const parsed = smoobuCreateBodySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonError(t(locale, "error.invalidRequest"), 400);
    }

    const body = parsed.data;

    switch (body.provider) {
      case "smoobu": {
        const integration = await insertIntegration(
          D1Database,
          ctx.userId,
          body
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
