import { getDb } from "@/db";
import { assets, images } from "@/db/schema";
import { assertBrokerOwnership } from "@/features/broker/auth/assertBrokerOwnership";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import { displayToKebab } from "@/features/broker/property/domain/sync-features";
import type { Feature } from "@/modules/constants";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import type { PropertyWithDetails } from "@/schemas/property";
import { updatePropertySchema } from "@/schemas/property";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "./responseHelpers";

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const locale = getRequestLocale(request);
  try {
    const { id } = params;
    if (!id) {
      return jsonError(t(locale, "error.missingPropertyId"), 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError(t(locale, "error.dbNotAvailable"), 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    if (!ctx.userId) {
      return jsonError(t(locale, "error.forbidden"), 403);
    }

    const [existing] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!existing) {
      return jsonError(t(locale, "error.propertyNotFound"), 404);
    }

    assertBrokerOwnership(existing, ctx);

    const body = await request.json();
    const validationResult = updatePropertySchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError(t(locale, "error.invalidRequest"), 400, validationResult.error.issues);
    }

    const data = validationResult.data;

    const normalizeFeatures = (features: Feature[] | undefined) =>
      features?.map((f) => ({ name: displayToKebab(f.name), icon: f.icon }));

    const normalizedData = {
      ...data,
      amenities: normalizeFeatures(data.amenities),
      highlights: normalizeFeatures(data.highlights),
      views: normalizeFeatures(data.views),
    };

    const [updated] = await db
      .update(assets)
      .set({
        ...(normalizedData as Partial<typeof assets.$inferInsert>),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assets.id, id))
      .returning();

    const propertyImages = await db
      .select()
      .from(images)
      .where(eq(images.assetId, id));

    const response: PropertyWithDetails = {
      ...updated,
      images: propertyImages,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error updating property:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to update property", locale),
      mapErrorToStatus(error)
    );
  }
};
