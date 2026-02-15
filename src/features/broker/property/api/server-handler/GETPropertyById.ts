import { getDb } from "@/db";
import { assets, images } from "@/db/schema";
import { assertBrokerOwnership } from "@/features/broker/auth/assertBrokerOwnership";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import type { PropertyWithDetails } from "@/schemas/property";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "./responseHelpers";

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return jsonError("Property ID required", 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    const [property] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!property) {
      return jsonError("Property not found", 404);
    }

    assertBrokerOwnership(property, ctx);

    const propertyImages = await db
      .select()
      .from(images)
      .where(eq(images.assetId, id));

    const response: PropertyWithDetails = {
      ...property,
      images: propertyImages,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error fetching property:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to fetch property"),
      mapErrorToStatus(error)
    );
  }
};
