import { getDb } from "@/db";
import { experienceImages, experiences } from "@/db/schema";
import { assertBrokerOwnership } from "@/features/broker/auth/assertBrokerOwnership";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import {
  validateImageSize,
  validateImageType,
} from "@/modules/r2/image-processor";
import {
  generateImageUrl,
  uploadImageToR2,
} from "@/modules/r2/r2-helpers";
import { genUniqueId } from "@/modules/utils/id";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "./responseHelpers";

function generateExperienceImageKey(
  experienceId: string,
  filename: string,
  isPrimary: boolean
): string {
  const uniqueId = genUniqueId("img");
  const sanitizedFilename = filename.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
  const prefix = isPrimary ? "primary" : uniqueId;
  return `experiences/${experienceId}/${prefix}-${sanitizedFilename}`;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const D1Database = locals.runtime?.env?.DB;
    const R2Bucket = locals.runtime?.env?.R2_IMAGES_BUCKET;

    if (!D1Database || !R2Bucket) {
      return jsonError("Required services not available", 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    const formData = await request.formData();
    const experienceId = formData.get("experienceId") as string;

    if (!experienceId) {
      return jsonError("Experience ID required", 400);
    }

    const [experience] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, experienceId))
      .limit(1);

    if (!experience) {
      return jsonError("Experience not found", 404);
    }

    assertBrokerOwnership(experience, ctx);

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

      if (!validateImageType(arrayBuffer)) {
        return jsonError(
          `Invalid image type for file: ${file.name}. Expected WebP.`,
          400
        );
      }

      if (!validateImageSize(arrayBuffer)) {
        return jsonError(
          `File too large: ${file.name}. Maximum size is 2MB`,
          400
        );
      }

      const filename = file.name.replace(/\.[^.]+$/, ".webp");
      const r2Key = generateExperienceImageKey(experienceId, filename, isPrimary);

      await uploadImageToR2(R2Bucket, r2Key, arrayBuffer, {
        contentType: "image/webp",
        alt,
      });

      const imageId = genUniqueId("eimg");

      const [savedImage] = await db
        .insert(experienceImages)
        .values({
          id: imageId,
          experienceId,
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

    return jsonSuccess({ images: uploadedImages }, 201);
  } catch (error) {
    console.error("Error uploading experience images:", error);
    return jsonError(
      safeErrorMessage(error, "Failed to upload images"),
      mapErrorToStatus(error)
    );
  }
};
