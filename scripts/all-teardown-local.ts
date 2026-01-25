#!/usr/bin/env bun
/**
 * All Teardown Local Script
 * Clears all local data: R2 and D1 by removing .wrangler directory
 * Then runs migrations to set up fresh database
 */

import { $ } from "bun";
import { join } from "node:path";

const ROOT_DIR = join(import.meta.dir, "..");
const DB_NAME = "booking-portal-db";

async function main() {
  console.log("🔥 All Teardown Local");
  console.log("========================================");

  const wranglerPath = join(ROOT_DIR, ".wrangler");
  const wranglerExists = await Bun.file(wranglerPath).exists();

  if (!wranglerExists) {
    console.log("\n⚠️  No .wrangler directory found - nothing to tear down");
  } else {
    console.log("\n🗑️  Removing .wrangler directory...");
    await $`rm -rf ${wranglerPath}`;
    console.log("✅ Local data cleared (R2 + D1)");
  }

  // Run migrations to set up fresh database
  console.log("\n🔧 Running migrations...");
  await $`bunx wrangler d1 migrations apply ${DB_NAME} --local`;
  console.log("✅ Migrations applied");

  console.log("\n✅ Local teardown complete");
}

main().catch((error) => {
  console.error("\n❌ Teardown failed:", error);
  process.exit(1);
});
