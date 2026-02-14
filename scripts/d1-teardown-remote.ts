#!/usr/bin/env bun
/**
 * D1 Teardown Remote Script
 * Clears all data from remote D1 database
 * Tables deleted in order respecting foreign key constraints
 */

import { unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DB_NAME = "booking-portal-db";
const ROOT_DIR = join(import.meta.dir, "..");

// Tables in deletion order (children first, parents last)
// Must match current schema in src/db/schema.ts
const TABLES_IN_DELETE_ORDER = [
  "reviews",
  "favorites",
  "bookings",
  "asset_experiences",
  "experience_images",
  "images",
  "broker_logs",
  "assets",
  "experiences",
  "pms_integrations",
  "brokers",
  "users",
];

function main() {
  console.log("🔥 D1 Teardown Remote");
  console.log(`   Database: ${DB_NAME}`);
  console.log("\n🧹 Tearing down remote D1 database...");

  const sqlPath = join(ROOT_DIR, ".remote-teardown.sql");
  const deleteStatements = TABLES_IN_DELETE_ORDER.map(
    (table) => `DELETE FROM ${table};`
  ).join("\n");

  writeFileSync(sqlPath, deleteStatements);

  try {
    const result = Bun.spawnSync(
      ["bunx", "wrangler", "d1", "execute", DB_NAME, `--file=${sqlPath}`, "--remote"],
      {
        cwd: ROOT_DIR,
        stdout: "pipe",
        stderr: "pipe",
        stdin: "inherit",
      }
    );

    if (result.exitCode === 0) {
      console.log(`  ✅ Cleared ${TABLES_IN_DELETE_ORDER.length} tables`);
    } else {
      // Some tables may not exist yet
      console.log("  ⚠️  Some tables may not exist (ignored)");
    }
  } finally {
    try {
      unlinkSync(sqlPath);
    } catch {
      // ignore
    }
  }

  console.log("\n✅ Teardown complete");
}

try {
  main();
} catch (error) {
  console.error("\n❌ Teardown failed:", error);
  process.exit(1);
}
