import { experiences, experienceImages, getDb } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import type { ExperienceWithDetails } from "@/schemas/experience";
import { updateExperienceSchema } from "@/schemas/experience";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const PATCH: APIRoute = async ({ params, request, locals }) => {
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
        ...data,
        status: data.status as "draft" | "published" | "archived" | undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(experiences.id, id))
      .returning();

    const imgs = await db
      .select()
      .from(experienceImages)
      .where(eq(experienceImages.experienceId, id));

    const response: ExperienceWithDetails = {
      ...updated,
      images: imgs,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error updating experience:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to update experience"
    );
  }
};
