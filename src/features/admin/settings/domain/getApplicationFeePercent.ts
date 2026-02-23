import type { getDb } from "@/db";
import { platformSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getApplicationFeePercent(
  db: ReturnType<typeof getDb>
): Promise<number> {
  const [row] = await db
    .select({ value: platformSettings.value })
    .from(platformSettings)
    .where(eq(platformSettings.key, "application_fee_percent"))
    .limit(1);

  if (!row) return 0;

  const n = Number(row.value);
  if (!Number.isInteger(n) || n < 0 || n > 100) return 0;
  return n;
}
