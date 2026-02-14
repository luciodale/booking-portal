const MAX_WIDTH = 2400;
const MAX_HEIGHT = 1800;
const WEBP_QUALITY = 0.85;

function loadImage(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

function computeDimensions(
  srcWidth: number,
  srcHeight: number,
  maxW: number,
  maxH: number,
): { width: number; height: number } {
  if (srcWidth <= maxW && srcHeight <= maxH) {
    return { width: srcWidth, height: srcHeight };
  }
  const ratio = Math.min(maxW / srcWidth, maxH / srcHeight);
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio),
  };
}

function canvasToFile(
  canvas: OffscreenCanvas,
  fileName: string,
): Promise<File> {
  return canvas.convertToBlob({ type: "image/webp", quality: WEBP_QUALITY }).then(
    (blob) =>
      new File([blob], fileName, { type: "image/webp" }),
  );
}

export async function processImage(file: File): Promise<File> {
  const bitmap = await loadImage(file);
  const { width, height } = computeDimensions(
    bitmap.width,
    bitmap.height,
    MAX_WIDTH,
    MAX_HEIGHT,
  );

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas 2d context");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webpName = file.name.replace(/\.[^.]+$/, ".webp");
  return canvasToFile(canvas, webpName);
}
