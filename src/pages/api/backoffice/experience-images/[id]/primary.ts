/**
 * Experience Image Management API - Set Primary Image
 * PUT /api/backoffice/experience-images/[id]/primary
 */

import { getDb } from "@/db";
import { experienceImages, experiences } from "@/db/schema";
import { assertBrokerOwnership } from "@/features/broker/auth/assertBrokerOwnership";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import {
  mapErrorToStatus,
  safeErrorMessage,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";

export const prerender = false;

export const PUT: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Image ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const D1Database = locals.runtime?.env?.DB;

    if (!D1Database) {
      return new Response(JSON.stringify({ error: "Database not available" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    const [image] = await db
      .select()
      .from(experienceImages)
      .where(eq(experienceImages.id, id))
      .limit(1);

    if (!image) {
      return new Response(JSON.stringify({ error: "Image not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [experience] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, image.experienceId))
      .limit(1);

    if (experience) {
      assertBrokerOwnership(experience, ctx);
    }

    await db
      .update(experienceImages)
      .set({ isPrimary: false })
      .where(
        and(
          eq(experienceImages.experienceId, image.experienceId),
          eq(experienceImages.isPrimary, true)
        )
      );

    await db
      .update(experienceImages)
      .set({ isPrimary: true })
      .where(eq(experienceImages.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error setting primary experience image:", error);
    return new Response(
      JSON.stringify({
        error: safeErrorMessage(error, "Failed to set primary image"),
      }),
      {
        status: mapErrorToStatus(error),
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
