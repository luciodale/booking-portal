import type { Config } from "drizzle-kit";

// dbCredentials are unused at runtime. Migrations are applied via
// `bunx wrangler d1 migrations apply booking-portal-db --local|--remote`,
// which uses the D1 binding from wrangler.json. drizzle-kit only needs the
// dialect, schema, and output dir to generate SQL diffs from snapshots.
export default {
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  driver: "d1-http",
  dbCredentials: {
    accountId: "placeholder",
    databaseId: "placeholder",
    token: "placeholder",
  },
} satisfies Config;
