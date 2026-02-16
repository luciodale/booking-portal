#!/usr/bin/env bun
/**
 * D1 Teardown Remote Script
 * Drops all tables from remote D1 database so migrations re-apply from scratch
 */

import { unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DB_NAME = "booking-portal-db";
const ROOT_DIR = join(import.meta.dir, "..");

// Tables in drop order (children first, parents last)
// Must match current schema in src/db/schema.ts
const TABLES_IN_DROP_ORDER = [
  "reviews",
  "favorites",
  "bookings",
  "experience_bookings",
  "asset_experiences",
  "experience_images",
  "images",
  "broker_logs",
  "event_logs",
  "city_tax_defaults",
  "assets",
  "experiences",
  "pms_integrations",
  "users",
  // Wrangler migration tracking table — drop so migrations re-apply from scratch
  "d1_migrations",
];

function main() {
  console.log("🔥 D1 Teardown Remote");
  console.log(`   Database: ${DB_NAME}`);
  console.log("\n🧹 Tearing down remote D1 database...");

  const sqlPath = join(ROOT_DIR, ".remote-teardown.sql");
  const dropStatements = TABLES_IN_DROP_ORDER.map(
    (table) => `DROP TABLE IF EXISTS ${table};`
  ).join("\n");

  writeFileSync(sqlPath, dropStatements);

  try {
    const result = Bun.spawnSync(
      [
        "bunx",
        "wrangler",
        "d1",
        "execute",
        DB_NAME,
        `--file=${sqlPath}`,
        "--remote",
      ],
      {
        cwd: ROOT_DIR,
        stdout: "inherit",
        stderr: "inherit",
        stdin: "inherit",
      }
    );

    if (result.exitCode === 0) {
      console.log(
        `  ✅ Dropped ${TABLES_IN_DROP_ORDER.length} tables (if they existed)`
      );
    } else {
      console.log("  ⚠️  Some drop statements failed (ignored)");
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
