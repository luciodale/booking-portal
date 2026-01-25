/**
 * R2 Helper Functions
 * Shared logic for uploading images to R2 bucket
 */

import { $ } from "bun";
import { join } from "node:path";

const BUCKET_NAME = "booking-portal-images";
const MAX_CONCURRENCY = 3; // Lower concurrency to prevent process exhaustion
const MAX_RETRIES = 3;

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

/**
 * Uploads a single file to R2 via Wrangler CLI
 * Includes internal retry logic and temp file cleanup
 */
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

  // Write temp file once
  await Bun.write(tempFile, data);

  const modeFlag = mode === "local" ? "--local" : "--remote";
  let lastError: Error | unknown;

  try {
    // Retry Loop
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Run quietly to prevent stdout spam, only catch errors
        const result =
          await $`bunx wrangler r2 object put ${BUCKET_NAME}/${key} --file=${tempFile} --content-type=${contentType} ${modeFlag}`.quiet();

        if (result.exitCode !== 0) {
          throw new Error(result.stderr.toString() || "Unknown wrangler error");
        }

        return; // Success!
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          // Exponential backoff: 500ms, 1000ms, 2000ms
          await new Promise((r) =>
            setTimeout(r, 500 * Math.pow(2, attempt - 1))
          );
        }
      }
    }

    // If we get here, all retries failed
    throw lastError;
  } finally {
    // Always clean up temp file
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
    // 1. Get image data
    const data = entry.isRemote
      ? await fetchRemoteImage(entry.sourcePath)
      : await readLocalFile(entry.sourcePath, rootDir);

    // 2. Upload to R2 (with retries handled inside)
    await uploadToR2(entry.r2Key, data, entry.contentType, mode, rootDir);

    const icon = entry.isRemote ? "🌐" : "📁";
    console.log(`${prefix} ${icon} ✅ ${entry.r2Key}`);
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`${prefix} ❌ FAILED: ${entry.r2Key}`);
    console.log(`       Error: ${msg}`);
    return false;
  }
}

/**
 * Concurrency Queue Runner
 * limits the number of active promises to MAX_CONCURRENCY
 */
async function runWithConcurrency<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<boolean>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  let index = 0;

  const executing = new Set<Promise<void>>();

  for (const item of items) {
    const currentIndex = index++;

    // Wrap the execution
    const p = fn(item, currentIndex).then((result) => {
      if (result) success++;
      else failed++;
      // Remove self from executing set
      executing.delete(p);
    });

    executing.add(p);

    // If we hit limits, wait for one to finish
    if (executing.size >= MAX_CONCURRENCY) {
      await Promise.race(executing);
    }
  }

  // Wait for the rest
  await Promise.all(executing);

  return { success, failed };
}

export async function seedImages(
  manifest: ImageManifest,
  mode: Mode,
  rootDir: string
): Promise<void> {
  const allImages = [...manifest.propertyImages, ...manifest.experienceImages];
  const total = allImages.length;

  console.log(`\n📤 Uploading ${total} images to R2 (${mode})...`);
  console.log(`   Concurrency: ${MAX_CONCURRENCY}`);

  // Use sequential for local (SQLite locking issues) or limited concurrent for remote
  const effectiveConcurrency = mode === "local" ? 1 : MAX_CONCURRENCY;

  // Manual concurrency loop
  const results = await runWithConcurrency(allImages, (entry, idx) =>
    processImage(entry, mode, idx, total, rootDir)
  );

  console.log(`\n${"=".repeat(40)}`);
  console.log("📊 Summary:");
  console.log(`  ✅ Uploaded: ${results.success}`);
  console.log(`  ❌ Failed: ${results.failed}`);
  console.log("=".repeat(40));

  if (results.failed > 0) {
    throw new Error(`${results.failed} image(s) failed to upload`);
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

  return await manifestFile.json();
}
