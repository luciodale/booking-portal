/**
 * Experience API Handlers
 * CRUD operations for experiences
 */

import { experienceImages, experiences, getDb } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import { generateImageUrl } from "@/modules/storage/r2-helpers";
import { genUniqueId } from "@/modules/utils/id";
import type { ExperienceListResponse, ExperienceResponse } from "@/schemas";
import { createExperienceSchema, updateExperienceSchema } from "@/schemas";
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
// GET - List Experiences
// ============================================================================

export const listExperiences: APIRoute = async ({ locals, url }) => {
  try {
    await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    // Parse query params
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    // Build query
    let query = db.select().from(experiences).$dynamic();

    // Apply filters
    const conditions = [];
    if (category) {
      conditions.push(eq(experiences.category, category));
    }
    if (status) {
      conditions.push(
        eq(experiences.status, status as "draft" | "published" | "archived")
      );
    }
    if (search) {
      conditions.push(
        or(
          like(experiences.title, `%${search}%`),
          like(experiences.location, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const experienceList = await query.orderBy(desc(experiences.createdAt));

    // Get primary images for each experience
    const experiencesWithImages = await Promise.all(
      experienceList.map(async (exp) => {
        const primaryImage = await db
          .select()
          .from(experienceImages)
          .where(
            and(
              eq(experienceImages.experienceId, exp.id),
              eq(experienceImages.isPrimary, true)
            )
          )
          .limit(1);

        return {
          ...exp,
          primaryImageUrl: primaryImage[0]
            ? generateImageUrl(primaryImage[0].r2Key)
            : undefined,
        };
      })
    );

    const response: ExperienceListResponse = {
      experiences: experiencesWithImages,
      total: experienceList.length,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error listing experiences:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to list experiences"
    );
  }
};

// ============================================================================
// POST - Create Experience
// ============================================================================

export const createExperience: APIRoute = async ({ request, locals }) => {
  try {
    await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    const body = await request.json();
    const validationResult = createExperienceSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError("Validation failed", 400, validationResult.error.issues);
    }

    const data = validationResult.data;
    const experienceId = genUniqueId("exp");

    const [newExperience] = await db
      .insert(experiences)
      .values({
        ...data,
        id: experienceId,
        brokerId: data.brokerId as string,
        status: (data.status || "draft") as "draft" | "published" | "archived",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    const response: ExperienceResponse = {
      ...newExperience,
      images: [],
    };

    return jsonSuccess(response, 201);
  } catch (error) {
    console.error("Error creating experience:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to create experience"
    );
  }
};

// ============================================================================
// GET - Get Single Experience
// ============================================================================

export const getExperience: APIRoute = async ({ params, locals }) => {
  try {
    await requireAdmin();

    const { id } = params;
    if (!id) {
      return jsonError("Experience ID required", 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    const [experience] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, id))
      .limit(1);

    if (!experience) {
      return jsonError("Experience not found", 404);
    }

    const expImages = await db
      .select()
      .from(experienceImages)
      .where(eq(experienceImages.experienceId, id));

    const response: ExperienceResponse = {
      ...experience,
      images: expImages,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error fetching experience:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to fetch experience"
    );
  }
};

// ============================================================================
// PUT - Update Experience
// ============================================================================

export const updateExperience: APIRoute = async ({
  params,
  request,
  locals,
}) => {
  try {
    await requireAdmin();

    const { id } = params;
    if (!id) {
      return jsonError("Experience ID required", 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    const [existing] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Experience not found", 404);
    }

    const body = await request.json();
    const validationResult = updateExperienceSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError("Validation failed", 400, validationResult.error.issues);
    }

    const data = validationResult.data;

    const [updated] = await db
      .update(experiences)
      .set({
        ...(data as Partial<typeof experiences.$inferInsert>),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(experiences.id, id))
      .returning();

    const expImages = await db
      .select()
      .from(experienceImages)
      .where(eq(experienceImages.experienceId, id));

    const response: ExperienceResponse = {
      ...updated,
      images: expImages,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error updating experience:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to update experience"
    );
  }
};

// ============================================================================
// DELETE - Soft Delete (Archive) Experience
// ============================================================================

export const deleteExperience: APIRoute = async ({ params, locals }) => {
  try {
    await requireAdmin();

    const { id } = params;
    if (!id) {
      return jsonError("Experience ID required", 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    const [existing] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Experience not found", 404);
    }

    await db
      .update(experiences)
      .set({
        status: "archived",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(experiences.id, id));

    return jsonSuccess({ message: "Experience archived successfully" });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to archive experience"
    );
  }
};
