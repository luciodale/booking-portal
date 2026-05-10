import { getDb } from "@/db";
import { experienceImages, experiences } from "@/db/schema";
import { assertBrokerOwnership } from "@/features/broker/auth/assertBrokerOwnership";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import type { ExperienceWithDetails } from "@/schemas/experience";
import { updateExperienceSchema } from "@/schemas/experience";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "./responseHelpers";

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const locale = getRequestLocale(request);
  try {
    const { id } = params;
    if (!id) {
      return jsonError(t(locale, "error.missingExperienceId"), 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError(t(locale, "error.dbNotAvailable"), 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    if (!ctx.userId) {
      return jsonError(t(locale, "error.forbidden"), 403);
    }

    const [existing] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, id))
      .limit(1);

    if (!existing) {
      return jsonError(t(locale, "error.experienceNotFound"), 404);
    }

    assertBrokerOwnership(existing, ctx);

    const body = await request.json();
    const validationResult = updateExperienceSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError(
        t(locale, "error.validationFailed"),
        400,
        validationResult.error.issues
      );
    }

    const data = validationResult.data;

    const [updated] = await db
      .update(experiences)
      .set({
        ...data,
        status: data.status as "draft" | "published" | "archived" | undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(experiences.id, id))
      .returning();

    const imgs = await db
      .select()
      .from(experienceImages)
      .where(eq(experienceImages.experienceId, id));

    const response: ExperienceWithDetails = {
      ...updated,
      images: imgs,
    };

    return jsonSuccess(response);
  } catch (error) {
    console.error("Error updating experience:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to update experience", locale),
      mapErrorToStatus(error)
    );
  }
};
