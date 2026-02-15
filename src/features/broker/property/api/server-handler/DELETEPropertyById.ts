import { getDb } from "@/db";
import { assets } from "@/db/schema";
import { assertBrokerOwnership } from "@/features/broker/auth/assertBrokerOwnership";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "./responseHelpers";

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return jsonError("Property ID required", 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    if (!ctx.userId) {
      return jsonError("Forbidden: No broker account", 403);
    }

    const [existing] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Property not found", 404);
    }

    assertBrokerOwnership(existing, ctx);

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
      safeErrorMessage(error, "Failed to archive property"),
      mapErrorToStatus(error)
    );
  }
};
