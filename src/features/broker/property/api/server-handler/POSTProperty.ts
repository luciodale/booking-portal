import { getDb } from "@/db";
import { assets } from "@/db/schema";
import { displayToKebab } from "@/features/broker/property/domain/sync-features";
import { requireAuth } from "@/modules/auth/auth";
import { genUniqueId } from "@/modules/utils/id";
import type { PropertyWithDetails } from "@/schemas/property";
import { createPropertySchema } from "@/schemas/property";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    requireAuth(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

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
        brokerId: normalizedData.brokerId as string,
        tier: (normalizedData.tier || "elite") as "elite" | "standard",
        status: (normalizedData.status || "draft") as
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
      error instanceof Error ? error.message : "Failed to create property"
    );
  }
};
