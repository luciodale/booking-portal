/**
 * R2 Bucket Helpers
 * Utilities for uploading, deleting, and managing images in Cloudflare R2
 */

import { genUniqueId } from "@/modules/utils/id";

export const R2_PUBLIC_URL = import.meta.env.DEV
  ? "/api/images"
  : "https://pub-9d13f1d66a7642979229f65d101a51c6.r2.dev";

/**
 * Uploads an image buffer to R2 bucket
 * @param bucket - R2 bucket binding from Cloudflare Workers
 * @param key - The key/path for the image (e.g., "properties/mallorca/main.webp")
 * @param buffer - Image data as Buffer or ArrayBuffer
 * @param metadata - Optional metadata for the image
 * @returns The R2 key of the uploaded image
 */
export async function uploadImageToR2(
  bucket: R2Bucket,
  key: string,
  buffer: ArrayBuffer,
  metadata?: {
    contentType?: string;
    alt?: string;
    assetId?: string;
  }
): Promise<string> {
  try {
    await bucket.put(key, buffer, {
      httpMetadata: {
        contentType: metadata?.contentType || "image/webp",
      },
      customMetadata: metadata
        ? {
            alt: metadata.alt || "",
            assetId: metadata.assetId || "",
          }
        : undefined,
    });

    return key;
  } catch (error) {
    throw new Error(
      `Failed to upload image to R2: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Deletes an image from R2 bucket
 * @param bucket - R2 bucket binding
 * @param key - The key/path of the image to delete
 */
export async function deleteImageFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  try {
    await bucket.delete(key);
  } catch (error) {
    throw new Error(
      `Failed to delete image from R2: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generates a public URL for an R2 image
 * @param key - The R2 key of the image
 * @returns Public URL to access the image
 */
export function generateImageUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Generates a unique key for an image upload
 * @param assetId - The asset ID this image belongs to
 * @param filename - Original filename
 * @param isPrimary - Whether this is the primary image
 * @returns A unique R2 key
 */
export function generateImageKey(
  assetId: string,
  filename: string,
  isPrimary = false
): string {
  const uniqueId = genUniqueId();
  const sanitizedFilename = filename.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
  const prefix = isPrimary ? "primary" : uniqueId;

  return `properties/${assetId}/${prefix}-${sanitizedFilename}`;
}
