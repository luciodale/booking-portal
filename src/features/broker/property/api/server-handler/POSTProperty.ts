import { getDb } from "@/db";
import { assets } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import { displayToKebab } from "@/features/broker/property/domain/sync-features";
import type { Feature } from "@/modules/constants";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import { genUniqueId } from "@/modules/utils/id";
import type { PropertyWithDetails } from "@/schemas/property";
import { createPropertySchema } from "@/schemas/property";
import type { APIRoute } from "astro";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "./responseHelpers";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const locale = getRequestLocale(request);
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
    const validationResult = createPropertySchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError(t(locale, "error.invalidRequest"), 400, validationResult.error.issues);
    }

    const data = validationResult.data;
    const propertyId = genUniqueId("prop");

    const normalizeFeatures = (features: Feature[] | undefined) =>
      features?.map((f) => ({ name: displayToKebab(f.name), icon: f.icon }));

    const normalizedData = {
      ...data,
      amenities: normalizeFeatures(data.amenities),
      highlights: normalizeFeatures(data.highlights),
      views: normalizeFeatures(data.views),
    };

    const [newProperty] = await db
      .insert(assets)
      .values({
        ...normalizedData,
        id: propertyId,
        userId: ctx.userId,
        tier: (normalizedData.tier || "elite") as "elite" | "standard",
        status: (normalizedData.status || "published") as
          | "draft"
          | "published"
          | "archived",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    const response: PropertyWithDetails = {
      ...newProperty,
      images: [],
    };

    return jsonSuccess(response, 201);
  } catch (error) {
    console.error("Error creating property:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to create property", locale),
      mapErrorToStatus(error)
    );
  }
};
