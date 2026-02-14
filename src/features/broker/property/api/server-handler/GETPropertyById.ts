import { assets, getDb, images } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import type { PropertyResponse } from "@/schemas";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const GET: APIRoute = async ({ params, locals }) => {
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

    const [property] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!property) {
      return jsonError("Property not found", 404);
    }

    const propertyImages = await db
      .select()
      .from(images)
      .where(eq(images.assetId, id));

    const response: PropertyResponse = {
      ...property,
      images: propertyImages,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error fetching property:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to fetch property"
    );
  }
};
