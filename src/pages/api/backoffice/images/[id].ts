/**
 * Image Management API - Delete Image
 * DELETE /api/backoffice/images/[id]
 */

import { getDb } from "@/db";
import { assets, images } from "@/db/schema";
import { assertBrokerOwnership } from "@/features/broker/auth/assertBrokerOwnership";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import { mapErrorToStatus } from "@/features/broker/property/api/server-handler/responseHelpers";
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

    // Get the image to find its R2 key
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

    // Look up parent asset for ownership check
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, image.assetId))
      .limit(1);

    if (asset) {
      assertBrokerOwnership(asset, ctx);
    }

    // Delete from R2 if bucket available
    if (R2Bucket && image.r2Key) {
      try {
        await R2Bucket.delete(image.r2Key);
      } catch (r2Error) {
        console.error("Failed to delete from R2:", r2Error);
        // Continue with DB deletion even if R2 fails
      }
    }

    // Delete from database
    await db.delete(images).where(eq(images.id, id));

    // If this was the primary image, we need to set another as primary
    if (image.isPrimary) {
      const [nextImage] = await db
        .select()
        .from(images)
        .where(eq(images.assetId, image.assetId))
        .limit(1);

      if (nextImage) {
        await db
          .update(images)
          .set({ isPrimary: true })
          .where(eq(images.id, nextImage.id));
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to delete image",
      }),
      {
        status: mapErrorToStatus(error),
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
