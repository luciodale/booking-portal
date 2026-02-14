import { getDb } from "@/db";
import { assets } from "@/db/schema";
import { requireAuth } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    requireAuth(locals);

    const { id } = params;
    if (!id) {
      return jsonError("Property ID required", 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    const [existing] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Property not found", 404);
    }

    await db
      .update(assets)
      .set({
        status: "archived",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assets.id, id));

    return jsonSuccess({ message: "Property archived successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to archive property"
    );
  }
};
