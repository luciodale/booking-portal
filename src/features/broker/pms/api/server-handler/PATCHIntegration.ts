import { getDb } from "@/db";
import { pmsIntegrations } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import type { TSafePmsIntegration } from "@/features/broker/pms/api/types";
import { SMOOBU_BASE_URL } from "@/features/broker/pms/integrations/smoobu/constants";
import {
  mapErrorToStatus,
  safeErrorMessage,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import type { SmoobuErrorResponse } from "@/schemas/smoobu";
import { smoobuUserSchema, verifyApiKeyRequestSchema } from "@/schemas/smoobu";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const PATCH: APIRoute = async ({ request, locals }) => {
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

    const body = await request.json();
    const validation = verifyApiKeyRequestSchema.safeParse(body);

    if (!validation.success) {
      return jsonError("Invalid API key format", 400, validation.error.issues);
    }

    const { apiKey } = validation.data;

    // Verify key against Smoobu /api/me
    const smoobuResponse = await fetch(`${SMOOBU_BASE_URL}/api/me`, {
      headers: {
        "Api-Key": apiKey,
        "Cache-Control": "no-cache",
      },
    });

    if (!smoobuResponse.ok) {
      const error: SmoobuErrorResponse = await smoobuResponse.json();
      return jsonError(
        error.detail || "Invalid API key",
        smoobuResponse.status
      );
    }

    const smoobuJson = (await smoobuResponse.json()) as unknown;
    const parsed = smoobuUserSchema.safeParse(smoobuJson);
    if (!parsed.success) {
      return jsonError("Invalid Smoobu user response", 502);
    }

    const now = new Date().toISOString();

    await db
      .update(pmsIntegrations)
      .set({
        apiKey,
        pmsUserId: parsed.data.id,
        pmsEmail: parsed.data.email,
        updatedAt: now,
      })
      .where(eq(pmsIntegrations.userId, ctx.userId));

    const [updated] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.userId, ctx.userId))
      .limit(1);

    if (!updated) {
      return jsonError("No integration found to update", 404);
    }

    const { apiKey: _k, ...safeIntegration } = updated;
    return jsonSuccess(safeIntegration satisfies TSafePmsIntegration);
  } catch (error) {
    console.error("Error updating integration API key:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to update API key", locale),
      mapErrorToStatus(error)
    );
  }
};
