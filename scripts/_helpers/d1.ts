/**
 * D1 Helper Functions
 * Shared logic for executing SQL against D1 database
 */

import { $ } from "bun";
import { join } from "node:path";

const DB_NAME = "booking-portal-db";

export type Mode = "local" | "remote";

export async function executeSql(sqlPath: string, mode: Mode): Promise<void> {
  console.log(`\n📤 Executing SQL against D1 (${mode})...`);

  const file = Bun.file(sqlPath);
  const exists = await file.exists();

  if (!exists) {
    throw new Error(`SQL file not found: ${sqlPath}`);
  }

  try {
    if (mode === "local") {
      await $`bunx wrangler d1 execute ${DB_NAME} --file=${sqlPath} --local`;
    } else {
      await $`bunx wrangler d1 execute ${DB_NAME} --file=${sqlPath} --remote`;
    }
    console.log("✅ SQL executed successfully");
  } catch (error) {
    console.error(
      "❌ SQL execution failed:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}

export async function checkExistingData(mode: Mode): Promise<boolean> {
  try {
    const checkSql = "SELECT COUNT(*) as count FROM brokers;";
    const tempFile = join(import.meta.dir, "../.check-data.sql");
    await Bun.write(tempFile, checkSql);

    const result =
      mode === "local"
        ? await $`bunx wrangler d1 execute ${DB_NAME} --file=${tempFile} --local --json`.quiet()
        : await $`bunx wrangler d1 execute ${DB_NAME} --file=${tempFile} --remote --json`.quiet();

    await $`rm -f ${tempFile}`.quiet();

    const data = JSON.parse(result.stdout.toString());
    const count = data?.[0]?.results?.[0]?.count || 0;

    return count > 0;
  } catch {
    // Table might not exist yet, that's fine
    return false;
  }
}

export async function generateSql(rootDir: string): Promise<void> {
  const sqlPath = join(rootDir, ".seed.sql");
  const sqlFile = Bun.file(sqlPath);
  const exists = await sqlFile.exists();

  if (!exists) {
    console.log("\n⚠️  No SQL file found, running generate-sql first...");
    await $`bun run ${join(rootDir, "scripts/generate-sql.ts")}`;
  }
}
