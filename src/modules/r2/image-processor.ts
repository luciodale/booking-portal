/**
 * Image Processing Utilities
 * Converts images to WebP format using Sharp
 */

import sharp from "sharp";

export interface ConvertToWebPOptions {
  quality?: number; // 1-100, default 85
  maxWidth?: number; // Max width in pixels
  maxHeight?: number; // Max height in pixels
}

/**
 * Converts an image buffer to WebP format
 * @param buffer - Original image buffer (PNG, JPG, JPEG, etc.)
 * @param options - Conversion options
 * @returns WebP image as Buffer
 */
export async function convertToWebP(
  buffer: ArrayBuffer,
  options: ConvertToWebPOptions = {}
): Promise<Buffer> {
  const { quality = 85, maxWidth, maxHeight } = options;

  try {
    let pipeline = sharp(Buffer.from(buffer));

    // Resize if dimensions are specified
    if (maxWidth || maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Convert to WebP
    const webpBuffer = await pipeline.webp({ quality }).toBuffer();

    return webpBuffer;
  } catch (error) {
    throw new Error(
      `Failed to convert image to WebP: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validates image file type
 * @param buffer - Image buffer to validate
 * @returns true if valid image type (PNG, JPG, JPEG)
 */
export async function validateImageType(buffer: ArrayBuffer): Promise<boolean> {
  try {
    const metadata = await sharp(Buffer.from(buffer)).metadata();
    return ["png", "jpeg", "jpg", "webp"].includes(metadata.format || "");
  } catch {
    return false;
  }
}

/**
 * Validates image file size
 * @param buffer - Image buffer to validate
 * @param maxSizeBytes - Maximum allowed size in bytes (default 10MB)
 * @returns true if size is within limit
 */
export function validateImageSize(
  buffer: ArrayBuffer,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB
): boolean {
  return buffer.byteLength <= maxSizeBytes;
}
