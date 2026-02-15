import { getDb } from "@/db";
import { experiences } from "@/db/schema";
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
      return jsonError("Experience ID required", 400);
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
      .from(experiences)
      .where(eq(experiences.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Experience not found", 404);
    }

    assertBrokerOwnership(existing, ctx);

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
      safeErrorMessage(error, "Failed to archive experience"),
      mapErrorToStatus(error)
    );
  }
};
