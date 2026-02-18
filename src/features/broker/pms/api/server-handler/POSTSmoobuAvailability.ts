import { getDb } from "@/db";
import { assets, pmsIntegrations } from "@/db/schema";
import { checkSmoobuAvailability } from "@/features/broker/pms/integrations/smoobu/server-service/POSTCheckAvailability";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess, safeErrorMessage } from "./responseHelpers";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const locale = getRequestLocale(request);
    const body = (await request.json()) as {
      smoobuPropertyId?: number;
      arrivalDate?: string;
      departureDate?: string;
      guests?: number;
    };

    const { smoobuPropertyId, arrivalDate, departureDate, guests } = body;

    if (!smoobuPropertyId || !arrivalDate || !departureDate) {
      return jsonError(t(locale, "error.missingRequiredFields"), 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError(t(locale, "error.dbNotAvailable"), 503);
    }

    const db = getDb(D1Database);

    // Find the asset by smoobuPropertyId to get the userId
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.smoobuPropertyId, smoobuPropertyId))
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

    const customerId = integration.pmsUserId;
    if (!customerId) {
      return jsonError(t(locale, "error.smoobuNotConfigured"), 500);
    }

    const availability = await checkSmoobuAvailability(integration.apiKey, {
      arrivalDate,
      departureDate,
      apartments: [smoobuPropertyId],
      customerId,
      guests,
    });

    return jsonSuccess(availability);
  } catch (error) {
    console.error("Error checking Smoobu availability:", error);
    return jsonError(
      safeErrorMessage(error, t(locale, "error.failedToCheckAvailability"), locale)
    );
  }
};
