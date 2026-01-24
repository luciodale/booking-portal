/**
 * Property Management API - Single Property Operations
 * GET /api/backoffice/properties/:id - Get single property with details
 * PUT /api/backoffice/properties/:id - Update property
 * DELETE /api/backoffice/properties/:id - Soft delete (archive) property
 */

import { assets, getDb, images, pricingRules } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { updatePropertySchema } from "@/modules/backoffice/domain/elite-schema";
import type { PropertyResponse } from "@/modules/shared/api/types";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

export const prerender = false;

// ============================================================================
// GET - Get Single Property
// ============================================================================

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

    // Fetch property
    const [property] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!property) {
      return jsonError("Property not found", 404);
    }

    // Fetch related images
    const propertyImages = await db
      .select()
      .from(images)
      .where(eq(images.assetId, id));

    // Fetch pricing rules
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

export const PUT: APIRoute = async ({ params, request, locals }) => {
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

    // Check if property exists
    const [existing] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Property not found", 404);
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePropertySchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError("Validation failed", 400, validationResult.error.issues);
    }

    const data = validationResult.data;

    // Update property
    const [updated] = await db
      .update(assets)
      .set({
        ...(data as Partial<typeof assets.$inferInsert>),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assets.id, id))
      .returning();

    // Fetch images and pricing rules for response
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

export const DELETE: APIRoute = async ({ params, locals }) => {
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

    // Check if property exists
    const [existing] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Property not found", 404);
    }

    // Soft delete by setting status to archived
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

// ============================================================================
// Helper Functions
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
