import { getDb } from "@/db";
import { assets } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import { displayToKebab } from "@/features/broker/property/domain/sync-features";
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
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    if (!ctx.userId) {
      return jsonError("Forbidden: No broker account", 403);
    }

    const body = await request.json();
    const validationResult = createPropertySchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError("Validation failed", 400, validationResult.error.issues);
    }

    const data = validationResult.data;
    const propertyId = genUniqueId("prop");

    const normalizedData = {
      ...data,
      amenities: data.amenities?.map(displayToKebab),
      highlights: data.highlights?.map(displayToKebab),
      views: data.views?.map(displayToKebab),
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
      safeErrorMessage(error, "Failed to create property"),
      mapErrorToStatus(error)
    );
  }
};
