/**
 * D1 Helper Functions
 * Shared logic for executing SQL against D1 database
 */

import { unlinkSync } from "node:fs";
import { join } from "node:path";

const DB_NAME = "booking-portal-db";

export type Mode = "local" | "remote";

function runWrangler(
  args: string[],
  cwd: string
): { ok: boolean; stdout: string } {
  const result = Bun.spawnSync(["bunx", "wrangler", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    stdin: "inherit",
  });
  return {
    ok: result.exitCode === 0,
    stdout: result.stdout.toString(),
  };
}

function runWranglerInherit(args: string[], cwd: string): void {
  const result = Bun.spawnSync(["bunx", "wrangler", ...args], {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  if (result.exitCode !== 0) {
    throw new Error(
      `wrangler ${args.join(" ")} failed with exit code ${result.exitCode}`
    );
  }
}

export async function executeSql(sqlPath: string, mode: Mode): Promise<void> {
  console.log(`\n📤 Executing SQL against D1 (${mode})...`);

  const file = Bun.file(sqlPath);
  const exists = await file.exists();

  if (!exists) {
    throw new Error(`SQL file not found: ${sqlPath}`);
  }

  const cwd = join(import.meta.dir, "../..");
  const modeFlag = mode === "local" ? "--local" : "--remote";

  runWranglerInherit(
    ["d1", "execute", DB_NAME, `--file=${sqlPath}`, modeFlag],
    cwd
  );
  console.log("✅ SQL executed successfully");
}

/**
 * Safely parse JSON from wrangler CLI stdout.
 * Wrangler may prepend warnings/banners before the actual JSON payload.
 */
function safeParseWranglerJson(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // Find first `[` or `{`
    const arrayStart = trimmed.indexOf("[");
    const objectStart = trimmed.indexOf("{");
    let start = -1;

    if (arrayStart === -1 && objectStart === -1) return null;
    if (arrayStart === -1) start = objectStart;
    else if (objectStart === -1) start = arrayStart;
    else start = Math.min(arrayStart, objectStart);

    try {
      return JSON.parse(trimmed.slice(start));
    } catch {
      return null;
    }
  }
}

export async function checkExistingData(mode: Mode): Promise<boolean> {
  const tempFile = join(import.meta.dir, "..", ".check-data.sql");

  try {
    await Bun.write(tempFile, "SELECT COUNT(*) as count FROM users;");

    const cwd = join(import.meta.dir, "../..");
    const modeFlag = mode === "local" ? "--local" : "--remote";
    const { ok, stdout } = runWrangler(
      ["d1", "execute", DB_NAME, `--file=${tempFile}`, modeFlag, "--json"],
      cwd
    );

    if (!ok) return false;

    const data = safeParseWranglerJson(stdout);
    if (!Array.isArray(data)) return false;

    const count = (data as Array<{ results?: Array<{ count?: number }> }>)[0]
      ?.results?.[0]?.count;
    return typeof count === "number" && count > 0;
  } catch {
    return false;
  } finally {
    try {
      unlinkSync(tempFile);
    } catch {
      // ignore
    }
  }
}

export async function generateSql(rootDir: string): Promise<void> {
  const sqlPath = join(rootDir, ".seed.sql");
  const sqlFile = Bun.file(sqlPath);
  const exists = await sqlFile.exists();

  if (!exists) {
    console.log("\n⚠️  No SQL file found, running generate-sql first...");
    const result = Bun.spawnSync(
      ["bun", "run", join(rootDir, "scripts/generate-sql.ts")],
      {
        cwd: rootDir,
        stdout: "inherit",
        stderr: "inherit",
        stdin: "inherit",
      }
    );

    if (result.exitCode !== 0) {
      throw new Error("generate-sql failed");
    }

    const afterGenerate = await Bun.file(sqlPath).exists();
    if (!afterGenerate) {
      throw new Error("generate-sql did not produce .seed.sql");
    }
  }
}
