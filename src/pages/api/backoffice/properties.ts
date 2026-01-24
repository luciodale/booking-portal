/**
 * Property Management API - List & Create
 * GET /api/backoffice/properties - List all properties with filtering
 * POST /api/backoffice/properties - Create new property
 */

import { assets, getDb, images } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { createPropertySchema } from "@/modules/backoffice/domain/elite-schema";
import type {
  PropertyListResponse,
  PropertyResponse,
} from "@/modules/shared/api/types";
import type { APIRoute } from "astro";
import { and, desc, eq, like, or } from "drizzle-orm";

export const prerender = false;

// ============================================================================
// GET - List Properties
// ============================================================================

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    // Auth check
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
      // Search in title and location
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

    // Execute with ordering
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
          primaryImageUrl: primaryImage[0]?.r2Path || undefined,
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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Auth check
    const authContext = await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createPropertySchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError("Validation failed", 400, validationResult.error.issues);
    }

    const data = validationResult.data;

    // Generate ID
    const propertyId = `prop-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Insert property with proper typing
    const [newProperty] = await db
      .insert(assets)
      .values({
        ...data,
        id: propertyId,
        brokerId: data.brokerId as string,
        type: (data.type || "apartment") as "apartment" | "boat" | "tour",
        tier: (data.tier || "elite") as "elite" | "standard",
        status: (data.status || "draft") as "draft" | "published" | "archived",
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
