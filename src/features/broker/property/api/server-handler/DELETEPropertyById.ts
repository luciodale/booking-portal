import { getDb } from "@/db";
import { assets, images } from "@/db/schema";
import { assertBrokerOwnership } from "@/features/broker/auth/assertBrokerOwnership";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import { createEventLogger } from "@/modules/logging/eventLogger";
import { deleteImageFromR2 } from "@/modules/r2/r2-helpers";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "./responseHelpers";

export const DELETE: APIRoute = async ({ params, locals, request }) => {
  const locale = getRequestLocale(request);
  try {
    const { id } = params;
    if (!id) {
      return jsonError(t(locale, "error.missingPropertyId"), 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    const R2 = locals.runtime?.env?.R2_IMAGES_BUCKET;
    if (!D1Database) {
      return jsonError(t(locale, "error.dbNotAvailable"), 503);
    }

    const db = getDb(D1Database);
    const log = createEventLogger(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    if (!ctx.userId) {
      return jsonError(t(locale, "error.forbidden"), 403);
    }

    const [existing] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!existing) {
      return jsonError(t(locale, "error.propertyNotFound"), 404);
    }

    assertBrokerOwnership(existing, ctx);

    // Reap R2 objects + image rows alongside the archive flip. Without
    // this, archived assets leave behind orphan R2 keys + image rows that
    // never get cleaned up, since the schema cascade only fires on hard
    // DELETE of the assets row (we soft delete by flipping status).
    const assetImages = await db
      .select({ id: images.id, r2Key: images.r2Key })
      .from(images)
      .where(eq(images.assetId, id));

    if (assetImages.length > 0) {
      if (R2) {
        const r2Failures: Array<{ key: string; error: string }> = [];
        for (const img of assetImages) {
          try {
            await deleteImageFromR2(R2, img.r2Key);
          } catch (err) {
            r2Failures.push({
              key: img.r2Key,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
        if (r2Failures.length > 0) {
          await log.warn({
            source: "property-archive",
            message: `R2 cleanup partially failed for asset ${id}`,
            metadata: { assetId: id, failures: r2Failures },
          });
        }
      } else {
        await log.warn({
          source: "property-archive",
          message: `R2 bucket binding missing during archive of asset ${id}; ${assetImages.length} object(s) left in place`,
          metadata: { assetId: id, count: assetImages.length },
        });
      }

      await db.delete(images).where(eq(images.assetId, id));
    }

    await db
      .update(assets)
      .set({
        status: "archived",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(assets.id, id));

    await log.info({
      source: "property-archive",
      message: `Asset ${id} archived; ${assetImages.length} image(s) reaped`,
      metadata: { assetId: id, imagesReaped: assetImages.length },
    });

    return jsonSuccess({ message: "Property archived successfully" });
  } catch (error) {
    return jsonError(
      safeErrorMessage(error, "Failed to archive property", locale),
      mapErrorToStatus(error)
    );
  }
};
