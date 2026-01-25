/**
 * R2 Helper Functions
 * Shared logic for uploading images to R2 bucket
 */

import { $ } from "bun";
import { join } from "node:path";

const BUCKET_NAME = "booking-portal-images";
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 500;

export type ImageManifestEntry = {
  r2Key: string;
  sourcePath: string;
  isRemote: boolean;
  contentType: string;
  alt?: string;
};

export type ImageManifest = {
  propertyImages: ImageManifestEntry[];
  experienceImages: ImageManifestEntry[];
};

export type Mode = "local" | "remote";

async function readLocalFile(
  path: string,
  rootDir: string
): Promise<ArrayBuffer> {
  const fullPath = join(rootDir, path);
  const file = Bun.file(fullPath);
  const exists = await file.exists();
  if (!exists) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return file.arrayBuffer();
}

async function fetchRemoteImage(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.arrayBuffer();
}

async function checkR2ObjectExists(key: string, mode: Mode): Promise<boolean> {
  try {
    const args =
      mode === "local"
        ? [
            "wrangler",
            "r2",
            "object",
            "get",
            `${BUCKET_NAME}/${key}`,
            "--local",
          ]
        : [
            "wrangler",
            "r2",
            "object",
            "get",
            `${BUCKET_NAME}/${key}`,
            "--remote",
          ];

    const proc = Bun.spawn(["bunx", ...args], {
      stdin: "ignore",
      stdout: "ignore",
      stderr: "ignore",
    });

    // Add timeout
    const timeoutPromise = new Promise<number>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout after 10s")), 10000);
    });

    const exitCode = await Promise.race([proc.exited, timeoutPromise]);
    return exitCode === 0;
  } catch {
    return false;
  }
}

async function uploadToR2(
  key: string,
  data: ArrayBuffer,
  contentType: string,
  mode: Mode,
  rootDir: string
): Promise<void> {
  const tempFile = join(
    rootDir,
    `.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  await Bun.write(tempFile, data);

  try {
    const args =
      mode === "local"
        ? [
            "wrangler",
            "r2",
            "object",
            "put",
            `${BUCKET_NAME}/${key}`,
            `--file=${tempFile}`,
            `--content-type=${contentType}`,
            "--local",
          ]
        : [
            "wrangler",
            "r2",
            "object",
            "put",
            `${BUCKET_NAME}/${key}`,
            `--file=${tempFile}`,
            `--content-type=${contentType}`,
            "--remote",
          ];

    const proc = Bun.spawn(["bunx", ...args], {
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
    });

    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      throw new Error(`Upload failed: ${stderr}`);
    }
  } finally {
    // Clean up temp file
    try {
      await $`rm -f ${tempFile}`.quiet();
    } catch {
      // Ignore cleanup errors
    }
  }
}

async function processImage(
  entry: ImageManifestEntry,
  mode: Mode,
  index: number,
  total: number,
  rootDir: string
): Promise<boolean> {
  const prefix = `[${index + 1}/${total}]`;

  try {
    // Check if object already exists
    const exists = await checkR2ObjectExists(entry.r2Key, mode);
    if (exists) {
      console.log(`${prefix} ⚠️  SKIPPED: ${entry.r2Key}`);
      return true;
    }

    // Get image data
    const data = entry.isRemote
      ? await fetchRemoteImage(entry.sourcePath)
      : await readLocalFile(entry.sourcePath, rootDir);

    // Upload to R2
    await uploadToR2(entry.r2Key, data, entry.contentType, mode, rootDir);

    const icon = entry.isRemote ? "🌐" : "📁";
    console.log(`${prefix} ${icon} ✅ ${entry.r2Key}`);
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`${prefix} ❌ FAILED: ${entry.r2Key}`);
    console.log(`  Error: ${msg}`);
    return false;
  }
}

export async function seedImages(
  manifest: ImageManifest,
  mode: Mode,
  rootDir: string
): Promise<void> {
  const allImages = [...manifest.propertyImages, ...manifest.experienceImages];
  const total = allImages.length;

  console.log(`\n📤 Uploading ${total} images to R2 (${mode})...`);

  let success = 0;
  let failed = 0;

  // Process in batches with delays
  for (let i = 0; i < allImages.length; i += BATCH_SIZE) {
    const batch = allImages.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allImages.length / BATCH_SIZE);

    console.log(`\n🔄 Batch ${batchNum}/${totalBatches}`);

    for (let j = 0; j < batch.length; j++) {
      const imageIndex = i + j;

      try {
        const result = await processImage(
          batch[j],
          mode,
          imageIndex,
          total,
          rootDir
        );
        if (result) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error("  Unexpected error:", error);
        failed++;
      }
    }

    // Add delay between batches (except after the last batch)
    if (i + BATCH_SIZE < allImages.length) {
      await Bun.sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`\n${"=".repeat(40)}`);
  console.log("📊 Summary:");
  console.log(`  ✅ Uploaded: ${success}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log("=".repeat(40));

  if (failed > 0) {
    throw new Error(`${failed} image(s) failed to upload`);
  }
}

export async function loadManifest(rootDir: string): Promise<ImageManifest> {
  const manifestPath = join(rootDir, ".image-manifest.json");

  const manifestFile = Bun.file(manifestPath);
  const exists = await manifestFile.exists();

  if (!exists) {
    console.log("\n⚠️  No manifest found, running collect-images first...");
    await $`bun run ${join(rootDir, "scripts/collect-images.ts")}`;
  }

  const manifestData = await manifestFile.text();
  const manifest = JSON.parse(manifestData);

  return manifest;
}
