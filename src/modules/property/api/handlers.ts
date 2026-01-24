/**
 * Property API Handlers
 * Extracted from pages/api/backoffice/properties.ts and properties/[id].ts
 */

import { assets, getDb, images, pricingRules } from "@/db";
import type {
  PropertyListResponse,
  PropertyResponse,
} from "@/modules/api-client/types";
import { requireAdmin } from "@/modules/auth/auth";
import {
  createPropertySchema,
  updatePropertySchema,
} from "@/modules/property/domain/schema";
import { displayToKebab } from "@/modules/property/domain/sync-features";
import { generateImageUrl } from "@/modules/storage/r2-helpers";
import { genUniqueId } from "@/modules/utils/id";
import type { APIRoute } from "astro";
import { and, desc, eq, like, or } from "drizzle-orm";

// ============================================================================
// Shared Response Helpers
// ============================================================================

function jsonSuccess<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 500, details?: unknown): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message, details },
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// ============================================================================
// GET - List Properties
// ============================================================================

export const listProperties: APIRoute = async ({ locals, url }) => {
  try {
    await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    // Parse query params
    const tier = url.searchParams.get("tier");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    // Build query
    let query = db.select().from(assets).$dynamic();

    // Apply filters
    const conditions = [];
    if (tier) {
      conditions.push(eq(assets.tier, tier as "elite" | "standard"));
    }
    if (status) {
      conditions.push(
        eq(assets.status, status as "draft" | "published" | "archived")
      );
    }
    if (search) {
      conditions.push(
        or(
          like(assets.title, `%${search}%`),
          like(assets.location, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const properties = await query.orderBy(desc(assets.createdAt));

    // Get primary images for each property
    const propertiesWithImages = await Promise.all(
      properties.map(async (property) => {
        const primaryImage = await db
          .select()
          .from(images)
          .where(
            and(eq(images.assetId, property.id), eq(images.isPrimary, true))
          )
          .limit(1);

        return {
          ...property,
          primaryImageUrl: primaryImage[0]
            ? generateImageUrl(primaryImage[0].r2Key)
            : undefined,
        };
      })
    );

    const response: PropertyListResponse = {
      properties: propertiesWithImages,
      total: properties.length,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error listing properties:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to list properties"
    );
  }
};

// ============================================================================
// POST - Create Property
// ============================================================================

export const createProperty: APIRoute = async ({ request, locals }) => {
  try {
    await requireAdmin();

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

    // Normalize tags to kebab-case (idempotent)
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

    const response: PropertyResponse = {
      ...newProperty,
      images: [],
      pricingRules: [],
    };

    return jsonSuccess(response, 201);
  } catch (error) {
    console.error("Error creating property:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to create property"
    );
  }
};

// ============================================================================
// GET - Get Single Property
// ============================================================================

export const getProperty: APIRoute = async ({ params, locals }) => {
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

    const propertyPricingRules = await db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.assetId, id));

    const response: PropertyResponse = {
      ...property,
      images: propertyImages,
      pricingRules: propertyPricingRules,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error fetching property:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to fetch property"
    );
  }
};

// ============================================================================
// PUT - Update Property
// ============================================================================

export const updateProperty: APIRoute = async ({ params, request, locals }) => {
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

    // Normalize tags to kebab-case (idempotent)
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

    const propertyPricingRules = await db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.assetId, id));

    const response: PropertyResponse = {
      ...updated,
      images: propertyImages,
      pricingRules: propertyPricingRules,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error updating property:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to update property"
    );
  }
};

// ============================================================================
// DELETE - Soft Delete (Archive) Property
// ============================================================================

export const deleteProperty: APIRoute = async ({ params, locals }) => {
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

    await db
      .update(assets)
      .set({
        status: "archived",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assets.id, id));

    return jsonSuccess({ message: "Property archived successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to archive property"
    );
  }
};
