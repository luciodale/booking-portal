/**
 * Image Upload API
 * POST /api/backoffice/upload-images - Upload and convert images to WebP
 */

import { getDb, images } from "@/db";
import { requireAdmin } from "@/lib/auth";
import {
  convertToWebP,
  validateImageSize,
  validateImageType,
} from "@/lib/image-processor";
import {
  generateImageKey,
  generateImageUrl,
  uploadImageToR2,
} from "@/lib/r2-helpers";
import type { UploadImagesResponse } from "@/modules/shared/api/types";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    await requireAdmin();

    const D1Database = locals.runtime?.env?.DB;
    const R2Bucket = locals.runtime?.env?.R2_IMAGES_BUCKET;

    if (!D1Database || !R2Bucket) {
      return jsonError("Required services not available", 503);
    }

    const db = getDb(D1Database);

    // Parse multipart form data
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

      // Read file buffer
      const arrayBuffer = await file.arrayBuffer();

      // Validate file type
      const isValidType = await validateImageType(arrayBuffer);
      if (!isValidType) {
        return jsonError(`Invalid image type for file: ${file.name}`, 400);
      }

      // Validate file size
      const isValidSize = validateImageSize(arrayBuffer);
      if (!isValidSize) {
        return jsonError(
          `File too large: ${file.name}. Maximum size is 10MB`,
          400
        );
      }

      // Convert to WebP
      const webpBuffer = await convertToWebP(arrayBuffer, {
        quality: 85,
        maxWidth: 2400,
        maxHeight: 1800,
      });

      // Generate R generateImageKey
      const filename = file.name.replace(/\.[^.]+$/, ".webp");
      const r2Key = generateImageKey(assetId, filename, isPrimary);

      // Upload to R2 (convert Buffer to ArrayBuffer)
      await uploadImageToR2(R2Bucket, r2Key, webpBuffer.buffer as ArrayBuffer, {
        contentType: "image/webp",
        alt,
        assetId,
      });

      // Generate image ID
      const imageId = `img-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Save to database
      const [savedImage] = await db
        .insert(images)
        .values({
          id: imageId,
          assetId,
          r2Path: generateImageUrl(r2Key),
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

function jsonSuccess<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 500, details?: unknown): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message, details },
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}
