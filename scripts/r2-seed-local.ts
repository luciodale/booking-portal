#!/usr/bin/env bun
/**
 * R2 Seed Local Script
 * Uploads images to local R2 bucket
 */

import { join } from "node:path";
import { loadManifest, seedImages } from "./_helpers/r2";

const ROOT_DIR = join(import.meta.dir, "..");

async function main() {
  console.log("========================================");
  console.log("🚀 R2 Seed Local - Starting");
  console.log("========================================");
  console.log("   Bucket: booking-portal-images (local)");
  console.log(`   Root: ${ROOT_DIR}`);

  const manifest = await loadManifest(ROOT_DIR);

  try {
    await seedImages(manifest, "local", ROOT_DIR);
    console.log("\n✅ R2 local seeding complete");
  } catch (error) {
    console.error("\n❌ R2 local seeding failed:");
    console.error(error);
    throw error;
  }
}

main().catch((error) => {
  console.error("\n❌ FATAL ERROR:");
  console.error(error);
  process.exit(1);
});
