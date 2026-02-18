import { getDb } from "@/db";
import { assets, pmsIntegrations } from "@/db/schema";
import { fetchSmoobuRates } from "@/features/broker/pms/integrations/smoobu/server-service/GETRates";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess, safeErrorMessage } from "./responseHelpers";

export const GET: APIRoute = async ({ locals, url, request }) => {
  try {
    const locale = getRequestLocale(request);
    const smoobuPropertyId = url.searchParams.get("smoobuPropertyId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!smoobuPropertyId || !startDate || !endDate) {
      return jsonError(t(locale, "error.missingRequiredParams"), 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError(t(locale, "error.dbNotAvailable"), 503);
    }

    const db = getDb(D1Database);

    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.smoobuPropertyId, Number(smoobuPropertyId)))
      .limit(1);

    if (!asset) {
      return jsonError(t(locale, "error.propertyNotFound"), 404);
    }

    const [integration] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.userId, asset.userId))
      .limit(1);

    if (!integration || integration.provider !== "smoobu") {
      return jsonError(t(locale, "error.noPmsIntegration"), 404);
    }

    const rates = await fetchSmoobuRates(
      integration.apiKey,
      Number(smoobuPropertyId),
      startDate,
      endDate
    );

    return jsonSuccess(rates);
  } catch (error) {
    console.error("Error fetching Smoobu rates:", error);
    return jsonError(
      safeErrorMessage(error, t(locale, "error.failedToFetchRates"), locale)
    );
  }
};
