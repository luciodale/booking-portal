import { getDb } from "@/db";
import { assets, pmsIntegrations } from "@/db/schema";
import { checkSmoobuAvailability } from "@/features/broker/pms/integrations/smoobu/server-service/POSTCheckAvailability";
import { safeErrorMessage } from "@/features/broker/property/api/server-handler/responseHelpers";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ params, request, locals }) => {
  const locale = getRequestLocale(request);
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: t(locale, "error.missingPropertyId") }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await request.json()) as {
      arrivalDate?: string;
      departureDate?: string;
      guests?: number;
    };

    const { arrivalDate, departureDate, guests } = body;
    if (!arrivalDate || !departureDate) {
      return new Response(
        JSON.stringify({
          error: t(locale, "error.missingRequiredFields"),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return new Response(JSON.stringify({ error: t(locale, "error.dbNotAvailable") }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb(D1Database);

    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!asset || !asset.smoobuPropertyId) {
      return new Response(
        JSON.stringify({ error: t(locale, "error.propertyNotFound") }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const [integration] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.userId, asset.userId))
      .limit(1);

    if (!integration || integration.provider !== "smoobu") {
      return new Response(
        JSON.stringify({ error: t(locale, "error.noPmsIntegration") }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const customerId = integration.pmsUserId;
    if (!customerId) {
      return new Response(
        JSON.stringify({ error: t(locale, "error.smoobuNotConfigured") }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const availability = await checkSmoobuAvailability(integration.apiKey, {
      arrivalDate,
      departureDate,
      apartments: [asset.smoobuPropertyId],
      customerId,
      guests,
    });

    return new Response(JSON.stringify({ data: availability }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return new Response(
      JSON.stringify({
        error: safeErrorMessage(error, t(locale, "error.failedToCheckAvailability"), locale),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
