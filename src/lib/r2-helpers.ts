/**
 * R2 Bucket Helpers
 * Utilities for uploading, deleting, and managing images in Cloudflare R2
 */

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
 * @param domain - Optional custom domain for R2 bucket (defaults to public bucket URL)
 * @returns Public URL to access the image
 *
 * @note Update this to use your actual R2 public bucket domain or custom domain
 */
export function generateImageUrl(key: string, domain?: string): string {
  // TODO: Update with your actual R2 public bucket URL or custom domain
  const baseUrl = domain || "https://pub-r2-images.example.com";
  return `${baseUrl}/${key}`;
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
  const timestamp = Date.now();
  const sanitizedFilename = filename.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
  const prefix = isPrimary ? "primary" : timestamp;

  return `properties/${assetId}/${prefix}-${sanitizedFilename}`;
}
