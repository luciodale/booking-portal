/**
 * Image Management API - Set Primary Image
 * PUT /api/backoffice/images/[id]/primary
 */

import { getDb } from "@/db";
import { assets, images } from "@/db/schema";
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

    // Look up parent asset for ownership check
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, image.assetId))
      .limit(1);

    if (asset) {
      assertBrokerOwnership(asset, ctx);
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
        error: safeErrorMessage(error, "Failed to set primary image"),
      }),
      {
        status: mapErrorToStatus(error),
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
