#!/usr/bin/env bun
/**
 * R2 Seed Remote Script
 * Uploads images to remote R2 bucket
 */

import { join } from "node:path";
import { loadManifest, seedImages } from "./_helpers/r2";

const ROOT_DIR = join(import.meta.dir, "..");

async function main() {
  console.log("========================================");
  console.log("🚀 R2 Seed Remote - Starting");
  console.log("========================================");
  console.log("   Bucket: booking-portal-images (remote)");
  console.log(`   Root: ${ROOT_DIR}`);

  const manifest = await loadManifest(ROOT_DIR);

  try {
    await seedImages(manifest, "remote", ROOT_DIR);
    console.log("\n✅ R2 remote seeding complete");
  } catch (error) {
    console.error("\n❌ R2 remote seeding failed:");
    console.error(error);
    throw error;
  }
}

main().catch((error) => {
  console.error("\n❌ FATAL ERROR:");
  console.error(error);
  process.exit(1);
});

