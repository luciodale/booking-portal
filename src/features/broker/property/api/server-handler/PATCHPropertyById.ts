import { assets, getDb, images } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import { displayToKebab } from "@/features/broker/property/domain/sync-features";
import type { PropertyResponse } from "@/schemas";
import { updatePropertySchema } from "@/schemas";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    await requireAdmin();

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

    const response: PropertyResponse = {
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
