import { getDb } from "@/db";
import { experiences } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import { genUniqueId } from "@/modules/utils/id";
import type { ExperienceWithDetails } from "@/schemas/experience";
import { createExperienceSchema } from "@/schemas/experience";
import type { APIRoute } from "astro";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "./responseHelpers";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    if (!ctx.userId) {
      return jsonError("Forbidden: No broker account", 403);
    }

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
        userId: ctx.userId,
        status: (data.status || "published") as "draft" | "published" | "archived",
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
      safeErrorMessage(error, "Failed to create experience"),
      mapErrorToStatus(error)
    );
  }
};
