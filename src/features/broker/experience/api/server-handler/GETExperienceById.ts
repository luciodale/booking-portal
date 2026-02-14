import { getDb } from "@/db";
import { experienceImages, experiences } from "@/db/schema";
import { assertBrokerOwnership } from "@/features/broker/auth/assertBrokerOwnership";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import type { ExperienceWithDetails } from "@/schemas/experience";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess, mapErrorToStatus } from "./responseHelpers";

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return jsonError("Experience ID required", 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    const [experience] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, id))
      .limit(1);

    if (!experience) {
      return jsonError("Experience not found", 404);
    }

    assertBrokerOwnership(experience, ctx);

    const imgs = await db
      .select()
      .from(experienceImages)
      .where(eq(experienceImages.experienceId, id));

    const response: ExperienceWithDetails = {
      ...experience,
      images: imgs,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error fetching experience:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to fetch experience",
      mapErrorToStatus(error)
    );
  }
};
