#!/usr/bin/env bun
/**
 * R2 Teardown Remote Script
 * Clears all objects from remote R2 bucket
 */

const BUCKET_NAME = "booking-portal-images";

/**
 * Safely parse JSON from wrangler CLI stdout.
 * Wrangler may prepend warnings/banners before the actual JSON payload.
 */
function safeParseJson(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const arrayStart = trimmed.indexOf("[");
    const objectStart = trimmed.indexOf("{");
    let start = -1;

    if (arrayStart === -1 && objectStart === -1) return null;
    if (arrayStart === -1) start = objectStart;
    else if (objectStart === -1) start = arrayStart;
    else start = Math.min(arrayStart, objectStart);

    try {
      return JSON.parse(trimmed.slice(start));
    } catch {
      return null;
    }
  }
}

function listObjects(): string[] {
  const result = Bun.spawnSync(
    ["bunx", "wrangler", "r2", "object", "list", BUCKET_NAME, "--remote", "--json"],
    { stdout: "pipe", stderr: "pipe", stdin: "inherit" }
  );

  if (result.exitCode !== 0) return [];

  const data = safeParseJson(result.stdout.toString());
  if (!data || typeof data !== "object") return [];

  const objects = (data as { objects?: Array<{ key: string }> }).objects;
  return objects?.map((obj) => obj.key) ?? [];
}

function deleteObjects(keys: string[]): void {
  if (keys.length === 0) {
    console.log("  No objects to delete");
    return;
  }

  for (const key of keys) {
    const result = Bun.spawnSync(
      ["bunx", "wrangler", "r2", "object", "delete", `${BUCKET_NAME}/${key}`, "--remote"],
      { stdout: "pipe", stderr: "pipe", stdin: "inherit" }
    );

    if (result.exitCode === 0) {
      console.log(`  🗑️  Deleted: ${key}`);
    } else {
      console.warn(`  ⚠️  Failed to delete: ${key}`);
    }
  }
}

function main() {
  console.log("🔥 R2 Teardown Remote");
  console.log(`   Bucket: ${BUCKET_NAME}`);
  console.log("\n🧹 Tearing down remote R2 bucket...");

  const objects = listObjects();
  console.log(`  Found ${objects.length} objects`);

  if (objects.length > 0) {
    deleteObjects(objects);
    console.log(`  ✅ Deleted ${objects.length} objects`);
  }

  console.log("\n✅ Teardown complete");
}

try {
  main();
} catch (error) {
  console.error("\n❌ Teardown failed:", error);
  process.exit(1);
}
