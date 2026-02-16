import { getDb } from "@/db";
import { assets, assetExperiences, experiences } from "@/db/schema";
import { assertBrokerOwnership } from "@/features/broker/auth/assertBrokerOwnership";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import { genUniqueId } from "@/modules/utils/id";
import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    if (!id) return jsonError("Experience ID required", 400);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    const [experience] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, id))
      .limit(1);

    if (!experience) return jsonError("Experience not found", 404);
    assertBrokerOwnership(experience, ctx);

    const body = (await request.json()) as { propertyId?: string };
    if (!body.propertyId) return jsonError("propertyId required", 400);

    const [property] = await db
      .select({ id: assets.id })
      .from(assets)
      .where(eq(assets.id, body.propertyId))
      .limit(1);

    if (!property) return jsonError("Property not found", 404);
    assertBrokerOwnership({ userId: experience.userId }, ctx);

    const [row] = await db
      .insert(assetExperiences)
      .values({
        id: genUniqueId("ae"),
        assetId: body.propertyId,
        experienceId: id,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return jsonSuccess(row, 201);
  } catch (error) {
    console.error("Error linking property:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to link property"),
      mapErrorToStatus(error)
    );
  }
};

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    if (!id) return jsonError("Experience ID required", 400);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    const [experience] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, id))
      .limit(1);

    if (!experience) return jsonError("Experience not found", 404);
    assertBrokerOwnership(experience, ctx);

    const body = (await request.json()) as { propertyId?: string };
    if (!body.propertyId) return jsonError("propertyId required", 400);

    await db
      .delete(assetExperiences)
      .where(
        and(
          eq(assetExperiences.experienceId, id),
          eq(assetExperiences.assetId, body.propertyId)
        )
      );

    return jsonSuccess({ deleted: true });
  } catch (error) {
    console.error("Error unlinking property:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to unlink property"),
      mapErrorToStatus(error)
    );
  }
};
