import { getDb } from "@/db";
import { images } from "@/db/schema";
import { requireAuth } from "@/modules/auth/auth";
import {
  convertToWebP,
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
import { jsonError, jsonSuccess } from "./responseHelpers";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    requireAuth(locals);

    const D1Database = locals.runtime?.env?.DB;
    const R2Bucket = locals.runtime?.env?.R2_IMAGES_BUCKET;

    if (!D1Database || !R2Bucket) {
      return jsonError("Required services not available", 503);
    }

    const db = getDb(D1Database);

    const formData = await request.formData();
    const assetId = formData.get("assetId") as string;

    if (!assetId) {
      return jsonError("Asset ID required", 400);
    }

    const uploadedImages = [];
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return jsonError("No images provided", 400);
    }

    if (files.length > 20) {
      return jsonError("Maximum 20 images allowed per upload", 400);
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPrimary = formData.get("isPrimary") === String(i);
      const alt = (formData.get(`alt_${i}`) as string) || file.name;

      const arrayBuffer = await file.arrayBuffer();

      const isValidType = await validateImageType(arrayBuffer);
      if (!isValidType) {
        return jsonError(`Invalid image type for file: ${file.name}`, 400);
      }

      const isValidSize = validateImageSize(arrayBuffer);
      if (!isValidSize) {
        return jsonError(
          `File too large: ${file.name}. Maximum size is 10MB`,
          400
        );
      }

      const webpBuffer = await convertToWebP(arrayBuffer, {
        quality: 85,
        maxWidth: 2400,
        maxHeight: 1800,
      });

      const filename = file.name.replace(/\.[^.]+$/, ".webp");
      const r2Key = generateImageKey(assetId, filename, isPrimary);

      await uploadImageToR2(R2Bucket, r2Key, webpBuffer.buffer as ArrayBuffer, {
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
      error instanceof Error ? error.message : "Failed to upload images"
    );
  }
};
