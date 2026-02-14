#!/usr/bin/env bun
/**
 * All Teardown Local Script
 * Clears all local data: R2 and D1 by removing .wrangler directory
 * Then runs migrations to set up fresh database
 */

import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const ROOT_DIR = join(import.meta.dir, "..");
const DB_NAME = "booking-portal-db";

function run(cmd: string[]): void {
  const result = Bun.spawnSync(cmd, {
    cwd: ROOT_DIR,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  if (result.exitCode !== 0) {
    throw new Error(
      `Command failed with exit code ${result.exitCode}: ${cmd.join(" ")}`
    );
  }
}

function main() {
  console.log("🔥 All Teardown Local");
  console.log("========================================");

  const wranglerPath = join(ROOT_DIR, ".wrangler");

  if (!existsSync(wranglerPath)) {
    console.log("\n⚠️  No .wrangler directory found - nothing to tear down");
  } else {
    console.log("\n🗑️  Removing .wrangler directory...");
    rmSync(wranglerPath, { recursive: true, force: true });
    console.log("✅ Local data cleared (R2 + D1)");
  }

  console.log("\n🔧 Running migrations...");
  run(["bunx", "wrangler", "d1", "migrations", "apply", DB_NAME, "--local"]);
  console.log("✅ Migrations applied");

  console.log("\n✅ Local teardown complete");
}

try {
  main();
} catch (error) {
  console.error("\n❌ Teardown failed:", error);
  process.exit(1);
}
