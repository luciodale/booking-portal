/**
 * R2 Helper Functions
 * Shared logic for uploading images to R2 bucket
 */

import { join } from "node:path";

const BUCKET_NAME = "booking-portal-images";
const MAX_CONCURRENCY = 15;
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
 * Uploads a single file to R2 via Wrangler CLI (async).
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

  await Bun.write(tempFile, data);

  const modeFlag = mode === "local" ? "--local" : "--remote";
  let lastError: unknown;

  try {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const proc = Bun.spawn(
        [
          "bunx",
          "wrangler",
          "r2",
          "object",
          "put",
          `${BUCKET_NAME}/${key}`,
          `--file=${tempFile}`,
          `--content-type=${contentType}`,
          modeFlag,
        ],
        {
          cwd: rootDir,
          stdout: "pipe",
          stderr: "pipe",
          stdin: "inherit",
        }
      );

      const exitCode = await proc.exited;

      if (exitCode === 0) return;

      const stderr = await new Response(proc.stderr).text();
      lastError = new Error(stderr || "Unknown wrangler error");
      if (attempt < MAX_RETRIES) {
        await Bun.sleep(500 * 2 ** (attempt - 1));
      }
    }

    throw lastError;
  } finally {
    try {
      const file = Bun.file(tempFile);
      if (await file.exists()) {
        const { unlinkSync } = await import("node:fs");
        unlinkSync(tempFile);
      }
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
    const data = entry.isRemote
      ? await fetchRemoteImage(entry.sourcePath)
      : await readLocalFile(entry.sourcePath, rootDir);

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

export async function seedImages(
  manifest: ImageManifest,
  mode: Mode,
  rootDir: string
): Promise<void> {
  const allImages = [...manifest.propertyImages, ...manifest.experienceImages];
  const total = allImages.length;

  console.log(`\n📤 Uploading ${total} images to R2 (${mode}) [concurrency=${MAX_CONCURRENCY}]...`);

  let success = 0;
  let failed = 0;

  // Process in batches of MAX_CONCURRENCY
  for (let i = 0; i < allImages.length; i += MAX_CONCURRENCY) {
    const chunk = allImages.slice(i, i + MAX_CONCURRENCY);
    const results = await Promise.all(
      chunk.map((entry, j) => processImage(entry, mode, i + j, total, rootDir))
    );
    for (const result of results) {
      if (result) success++;
      else failed++;
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
  let manifestFile = Bun.file(manifestPath);
  let exists = await manifestFile.exists();

  if (!exists) {
    console.log("\n⚠️  No manifest found, running collect-images first...");
    const result = Bun.spawnSync(
      ["bun", "run", join(rootDir, "scripts/collect-images.ts")],
      {
        cwd: rootDir,
        stdout: "inherit",
        stderr: "inherit",
        stdin: "inherit",
      }
    );

    if (result.exitCode !== 0) {
      throw new Error("collect-images failed");
    }

    manifestFile = Bun.file(manifestPath);
    exists = await manifestFile.exists();
    if (!exists) {
      throw new Error("collect-images did not produce .image-manifest.json");
    }
  }

  const text = await manifestFile.text();
  if (!text.trim()) {
    throw new Error(".image-manifest.json is empty");
  }

  try {
    return JSON.parse(text) as ImageManifest;
  } catch (e) {
    throw new Error(
      `.image-manifest.json contains invalid JSON: ${e instanceof Error ? e.message : e}`
    );
  }
}
