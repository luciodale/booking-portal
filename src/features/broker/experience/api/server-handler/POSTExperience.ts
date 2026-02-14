import { getDb } from "@/db";
import { experiences } from "@/db/schema";
import { requireAuth } from "@/modules/auth/auth";
import { genUniqueId } from "@/modules/utils/id";
import type { ExperienceWithDetails } from "@/schemas/experience";
import { createExperienceSchema } from "@/schemas/experience";
import type { APIRoute } from "astro";
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
        status: (data.status || "draft") as "draft" | "published" | "archived",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    const response: ExperienceWithDetails = {
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
