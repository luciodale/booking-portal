import { getDb } from "@/db";
import { assets, images } from "@/db/schema";
import { assertBrokerOwnership } from "@/features/broker/auth/assertBrokerOwnership";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import {
  validateImageSize,
  validateImageType,
} from "@/modules/r2/image-processor";
import {
  generateImageKey,
  generateImageUrl,
  uploadImageToR2,
} from "@/modules/r2/r2-helpers";
import { genUniqueId } from "@/modules/utils/id";
import type { UploadImagesResponse } from "@/schemas/api";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "./responseHelpers";

export const POST: APIRoute = async ({ request, locals }) => {
  const locale = getRequestLocale(request);
  try {
    const D1Database = locals.runtime?.env?.DB;
    const R2Bucket = locals.runtime?.env?.R2_IMAGES_BUCKET;

    if (!D1Database || !R2Bucket) {
      return jsonError(t(locale, "error.dbNotAvailable"), 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    const formData = await request.formData();
    const assetId = formData.get("assetId") as string;

    if (!assetId) {
      return jsonError(t(locale, "error.missingPropertyId"), 400);
    }

    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, assetId))
      .limit(1);

    if (!asset) {
      return jsonError(t(locale, "error.propertyNotFound"), 404);
    }

    assertBrokerOwnership(asset, ctx);

    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return jsonError(t(locale, "error.invalidRequest"), 400);
    }

    if (files.length > 20) {
      return jsonError(t(locale, "error.invalidRequest"), 400);
    }

    // Phase 1: validate all files before any uploads
    const prepared: Array<{
      file: File;
      isPrimary: boolean;
      alt: string;
      arrayBuffer: ArrayBuffer;
      r2Key: string;
      imageId: string;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPrimary = formData.get("isPrimary") === String(i);
      const rawAlt = (formData.get(`alt_${i}`) as string) || file.name;
      const alt = rawAlt.replace(/<[^>]*>/g, "").slice(0, 500);
      const arrayBuffer = await file.arrayBuffer();

      if (!validateImageType(arrayBuffer) || !validateImageSize(arrayBuffer)) {
        return jsonError(t(locale, "error.invalidRequest"), 400);
      }

      const filename = file.name.replace(/\.[^.]+$/, ".webp");
      const r2Key = generateImageKey(assetId, filename, isPrimary);
      const imageId = genUniqueId("img");

      prepared.push({ file, isPrimary, alt, arrayBuffer, r2Key, imageId });
    }

    // Phase 2: upload all to R2, rolling back on failure
    const uploadedR2Keys: string[] = [];
    try {
      for (const item of prepared) {
        await uploadImageToR2(R2Bucket, item.r2Key, item.arrayBuffer, {
          contentType: "image/webp",
          alt: item.alt,
          assetId,
        });
        uploadedR2Keys.push(item.r2Key);
      }
    } catch (r2Error) {
      for (const key of uploadedR2Keys) {
        try {
          await R2Bucket.delete(key);
        } catch {}
      }
      throw r2Error;
    }

    // Phase 3: batch insert all DB records. On failure, undo phase 2.
    const dbRows = prepared.map((item, i) => ({
      id: item.imageId,
      assetId,
      r2Key: item.r2Key,
      alt: item.alt,
      isPrimary: item.isPrimary,
      order: i,
      createdAt: new Date().toISOString(),
    }));

    const savedImages = await (async () => {
      try {
        return await db.insert(images).values(dbRows).returning();
      } catch (dbError) {
        for (const key of uploadedR2Keys) {
          try {
            await R2Bucket.delete(key);
          } catch {}
        }
        throw dbError;
      }
    })();

    const response: UploadImagesResponse = {
      images: savedImages.map((img) => ({
        ...img,
        url: generateImageUrl(img.r2Key),
      })),
    };

    return jsonSuccess(response, 201);
  } catch (error) {
    return jsonError(
      safeErrorMessage(error, "Failed to upload images", locale),
      mapErrorToStatus(error)
    );
  }
};
