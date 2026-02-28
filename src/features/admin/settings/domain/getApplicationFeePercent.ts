import type { getDb } from "@/db";
import { brokerFeeOverrides, platformSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getApplicationFeePercent(
  db: ReturnType<typeof getDb>,
  brokerUserId: string
): Promise<number> {
  // Check per-broker override first
  const [override] = await db
    .select({ feePercent: brokerFeeOverrides.feePercent })
    .from(brokerFeeOverrides)
    .where(eq(brokerFeeOverrides.userId, brokerUserId))
    .limit(1);

  if (override) return override.feePercent;

  // Fall back to global platform setting
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
