import { getDb } from "@/db";
import { assets, images } from "@/db/schema";
import { displayToKebab } from "@/features/broker/property/domain/sync-features";
import { requireAuth } from "@/modules/auth/auth";
import type { PropertyWithDetails } from "@/schemas/property";
import { updatePropertySchema } from "@/schemas/property";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    requireAuth(locals);

    const { id } = params;
    if (!id) {
      return jsonError("Property ID required", 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    const [existing] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Property not found", 404);
    }

    const body = await request.json();
    const validationResult = updatePropertySchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError("Validation failed", 400, validationResult.error.issues);
    }

    const data = validationResult.data;

    const normalizedData = {
      ...data,
      amenities: data.amenities?.map(displayToKebab),
      highlights: data.highlights?.map(displayToKebab),
      views: data.views?.map(displayToKebab),
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
      error instanceof Error ? error.message : "Failed to update property"
    );
  }
};
