#!/usr/bin/env bun
/**
 * D1 Seed Remote Script
 * Executes SQL seed against remote D1 database
 */

import { join } from "node:path";
import { checkExistingData, executeSql, generateSql } from "./_helpers/d1";

const ROOT_DIR = join(import.meta.dir, "..");
const SQL_PATH = join(ROOT_DIR, ".seed.sql");

async function main() {
  console.log("========================================");
  console.log("🚀 D1 Seed Remote - Starting");
  console.log("========================================");
  console.log(`   Database: booking-portal-db (remote)`);
  console.log(`   Root: ${ROOT_DIR}`);

  // Generate SQL if needed
  await generateSql(ROOT_DIR);

  // Check for existing data
  const hasData = await checkExistingData("remote");
  if (hasData) {
    console.log("\n⚠️  Database already contains data - will be replaced");
  }

  // Execute SQL
  await executeSql(SQL_PATH, "remote");

  console.log("\n✅ D1 remote seeding complete");
}

main().catch((error) => {
  console.error("\n❌ D1 remote seeding failed:", error);
  process.exit(1);
});

