#!/usr/bin/env bun
/**
 * D1 Teardown Remote Script
 * Clears all data from remote D1 database
 * Tables deleted in order respecting foreign key constraints
 */

import { join } from "node:path";
import { $ } from "bun";

const DB_NAME = "booking-portal-db";
const ROOT_DIR = join(import.meta.dir, "..");

// Tables in deletion order (children first, parents last)
const TABLES_IN_DELETE_ORDER = [
  "reviews",
  "favorites",
  "bookings",
  "channel_markups",
  "asset_experiences",
  "experience_images",
  "images",
  "pricing_rules",
  "availabilities",
  "assets",
  "experiences",
  "brokers",
  "users",
  "channels",
];

async function executeSql(sql: string): Promise<void> {
  const sqlPath = join(ROOT_DIR, ".remote-teardown.sql");

  await Bun.write(sqlPath, sql);

  try {
    await $`bunx wrangler d1 execute ${DB_NAME} --file=${sqlPath} --remote`.quiet();
  } catch (error) {
    // Ignore errors for non-existent tables
  }
}

async function teardown(): Promise<void> {
  console.log("\n🧹 Tearing down remote D1 database...");

  const deleteStatements = TABLES_IN_DELETE_ORDER.map(
    (table) => `DELETE FROM ${table};`
  ).join("\n");

  await executeSql(deleteStatements);
  console.log(`  ✅ Cleared ${TABLES_IN_DELETE_ORDER.length} tables`);
}

async function main() {
  console.log("🔥 D1 Teardown Remote");
  console.log(`   Database: ${DB_NAME}`);

  await teardown();

  console.log("\n✅ Teardown complete");
}

main().catch(console.error);

