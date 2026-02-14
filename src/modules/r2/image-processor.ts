const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * Validates that the buffer contains a WebP image via RIFF/WebP magic bytes.
 * Bytes 0-3: "RIFF", bytes 8-11: "WEBP"
 */
export function validateImageType(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 12) return false;
  const bytes = new Uint8Array(buffer);

  const isRIFF =
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46; // F

  const isWEBP =
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50; // P

  return isRIFF && isWEBP;
}

export function validateImageSize(
  buffer: ArrayBuffer,
  maxSizeBytes: number = MAX_SIZE_BYTES
): boolean {
  return buffer.byteLength <= maxSizeBytes;
}
