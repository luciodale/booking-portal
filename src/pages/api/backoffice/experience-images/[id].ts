/**
 * Experience Image Management API - Delete Image
 * DELETE /api/backoffice/experience-images/[id]
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
import { eq } from "drizzle-orm";

export const prerender = false;

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Image ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const D1Database = locals.runtime?.env?.DB;
    const R2Bucket = locals.runtime?.env?.R2_IMAGES_BUCKET;

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

    if (R2Bucket && image.r2Key) {
      try {
        await R2Bucket.delete(image.r2Key);
      } catch (r2Error) {
        console.error("Failed to delete from R2:", r2Error);
      }
    }

    await db.delete(experienceImages).where(eq(experienceImages.id, id));

    if (image.isPrimary) {
      const [nextImage] = await db
        .select()
        .from(experienceImages)
        .where(eq(experienceImages.experienceId, image.experienceId))
        .limit(1);

      if (nextImage) {
        await db
          .update(experienceImages)
          .set({ isPrimary: true })
          .where(eq(experienceImages.id, nextImage.id));
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting experience image:", error);
    return new Response(
      JSON.stringify({
        error: safeErrorMessage(error, "Failed to delete image"),
      }),
      {
        status: mapErrorToStatus(error),
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
