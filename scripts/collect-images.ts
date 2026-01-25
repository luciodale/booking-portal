#!/usr/bin/env bun
/**
 * Collect Images Script
 * Gathers all local and remote images from seed data and outputs a manifest
 */

import { join } from "node:path";
import { experiences, images } from "../seeds/data";

type ImageManifestEntry = {
  r2Key: string;
  sourcePath: string;
  isRemote: boolean;
  contentType: string;
  alt?: string;
};

type ImageManifest = {
  propertyImages: ImageManifestEntry[];
  experienceImages: ImageManifestEntry[];
};

const ROOT_DIR = join(import.meta.dir, "..");

function isRemoteUrl(path: string): boolean {
  return path.startsWith("http://") || path.startsWith("https://");
}

function getContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "webp":
      return "image/webp";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    default:
      return "image/webp";
  }
}

async function verifyLocalFile(path: string): Promise<boolean> {
  try {
    const fullPath = join(ROOT_DIR, path);
    const file = Bun.file(fullPath);
    return await file.exists();
  } catch {
    return false;
  }
}

async function collectImages(): Promise<ImageManifest> {
  const propertyImages: ImageManifestEntry[] = [];
  const experienceImages: ImageManifestEntry[] = [];

  // Collect property images
  console.log("📷 Collecting property images...");
  for (const img of images) {
    const isRemote = isRemoteUrl(img.sourcePath);

    if (!isRemote) {
      const exists = await verifyLocalFile(img.sourcePath);
      if (!exists) {
        console.warn(`  ⚠️  Local file not found: ${img.sourcePath}`);
        continue;
      }
    }

    propertyImages.push({
      r2Key: img.r2Key,
      sourcePath: img.sourcePath,
      isRemote,
      contentType: getContentType(img.sourcePath),
      alt: img.alt ?? undefined,
    });
    console.log(
      `  ${isRemote ? "🌐" : "📁"} ${img.r2Key} <- ${img.sourcePath}`
    );
  }

  // Collect experience images
  console.log("\n🎯 Collecting experience images...");
  for (const exp of experiences) {
    if (!exp.imageUrl) continue;

    const r2Key = `experiences/${exp.id}/main.webp`;
    const isRemote = isRemoteUrl(exp.imageUrl);

    if (!isRemote) {
      const exists = await verifyLocalFile(exp.imageUrl);
      if (!exists) {
        console.warn(`  ⚠️  Local file not found: ${exp.imageUrl}`);
        continue;
      }
    }

    experienceImages.push({
      r2Key,
      sourcePath: exp.imageUrl,
      isRemote,
      contentType: "image/webp",
      alt: exp.title,
    });
    console.log(`  ${isRemote ? "🌐" : "📁"} ${r2Key} <- ${exp.imageUrl}`);
  }

  return { propertyImages, experienceImages };
}

async function main() {
  console.log("🔍 Collecting images from seed data...\n");

  const manifest = await collectImages();

  const totalImages =
    manifest.propertyImages.length + manifest.experienceImages.length;
  const localImages = [
    ...manifest.propertyImages,
    ...manifest.experienceImages,
  ].filter((i) => !i.isRemote).length;
  const remoteImages = totalImages - localImages;

  console.log("\n📊 Summary:");
  console.log(`  Property images: ${manifest.propertyImages.length}`);
  console.log(`  Experience images: ${manifest.experienceImages.length}`);
  console.log(`  Local files: ${localImages}`);
  console.log(`  Remote URLs: ${remoteImages}`);
  console.log(`  Total: ${totalImages}`);

  // Output manifest as JSON for piping to other scripts
  const output = JSON.stringify(manifest, null, 2);
  await Bun.write(join(ROOT_DIR, ".image-manifest.json"), output);
  console.log("\n✅ Manifest written to .image-manifest.json");
}

main().catch(console.error);
