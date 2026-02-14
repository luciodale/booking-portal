/**
 * Image Management API - Set Primary Image
 * PUT /api/backoffice/images/[id]/primary
 */

import { getDb } from "@/db";
import { images } from "@/db/schema";
import { requireAuth } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";

export const prerender = false;

export const PUT: APIRoute = async ({ params, locals }) => {
  try {
    requireAuth(locals);

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

    // Get the image to find its asset ID
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.id, id))
      .limit(1);

    if (!image) {
      return new Response(JSON.stringify({ error: "Image not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Remove primary from all other images of this asset
    await db
      .update(images)
      .set({ isPrimary: false })
      .where(
        and(eq(images.assetId, image.assetId), eq(images.isPrimary, true))
      );

    // Set this image as primary
    await db.update(images).set({ isPrimary: true }).where(eq(images.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error setting primary image:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to set primary image",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
