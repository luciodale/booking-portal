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

    const uploadedImages = [];
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return jsonError(t(locale, "error.invalidRequest"), 400);
    }

    if (files.length > 20) {
      return jsonError(t(locale, "error.invalidRequest"), 400);
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPrimary = formData.get("isPrimary") === String(i);
      const alt = (formData.get(`alt_${i}`) as string) || file.name;

      const arrayBuffer = await file.arrayBuffer();

      if (!validateImageType(arrayBuffer)) {
        return jsonError(
          t(locale, "error.invalidRequest"),
          400
        );
      }

      if (!validateImageSize(arrayBuffer)) {
        return jsonError(
          t(locale, "error.invalidRequest"),
          400
        );
      }

      const filename = file.name.replace(/\.[^.]+$/, ".webp");
      const r2Key = generateImageKey(assetId, filename, isPrimary);

      await uploadImageToR2(R2Bucket, r2Key, arrayBuffer, {
        contentType: "image/webp",
        alt,
        assetId,
      });

      const imageId = genUniqueId("img");

      const [savedImage] = await db
        .insert(images)
        .values({
          id: imageId,
          assetId,
          r2Key,
          alt,
          isPrimary,
          order: i,
          createdAt: new Date().toISOString(),
        })
        .returning();

      uploadedImages.push({
        ...savedImage,
        url: generateImageUrl(r2Key),
      });
    }

    const response: UploadImagesResponse = {
      images: uploadedImages,
    };

    return jsonSuccess(response, 201);
  } catch (error) {
    console.error("Error uploading images:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to upload images", locale),
      mapErrorToStatus(error)
    );
  }
};
