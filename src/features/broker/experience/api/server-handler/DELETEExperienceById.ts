import { experiences, getDb } from "@/db";
import { requireAdmin } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { jsonError, jsonSuccess } from "./responseHelpers";

export const DELETE: APIRoute = async ({ params, locals }) => {
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

    await db
      .update(experiences)
      .set({
        status: "archived",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(experiences.id, id));

    return jsonSuccess({ message: "Experience archived successfully" });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to archive experience"
    );
  }
};
