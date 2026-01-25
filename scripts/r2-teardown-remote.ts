#!/usr/bin/env bun
/**
 * R2 Teardown Remote Script
 * Clears all objects from remote R2 bucket
 */

import { $ } from "bun";

const BUCKET_NAME = "booking-portal-images";

async function listObjects(): Promise<string[]> {
  try {
    const result =
      await $`bunx wrangler r2 object list ${BUCKET_NAME} --remote --json`.quiet();
    const data = JSON.parse(result.stdout.toString());
    return data.objects?.map((obj: { key: string }) => obj.key) || [];
  } catch (error) {
    // Bucket might be empty or not exist
    return [];
  }
}

async function deleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) {
    console.log("  No objects to delete");
    return;
  }

  // Delete in parallel batches of 10
  const batchSize = 10;
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (key) => {
        try {
          await $`bunx wrangler r2 object delete ${BUCKET_NAME}/${key} --remote`.quiet();
          console.log(`  🗑️  Deleted: ${key}`);
        } catch (error) {
          console.warn(`  ⚠️  Failed to delete: ${key}`);
        }
      })
    );
  }
}

async function teardown(): Promise<void> {
  console.log("\n🧹 Tearing down remote R2 bucket...");

  const objects = await listObjects();
  console.log(`  Found ${objects.length} objects`);

  if (objects.length > 0) {
    await deleteObjects(objects);
    console.log(`  ✅ Deleted ${objects.length} objects`);
  }
}

async function main() {
  console.log("🔥 R2 Teardown Remote");
  console.log(`   Bucket: ${BUCKET_NAME}`);

  await teardown();

  console.log("\n✅ Teardown complete");
}

main().catch(console.error);

