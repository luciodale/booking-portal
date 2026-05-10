import type { getDb } from "@/db";
import { brokerFeeOverrides, platformSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const DEFAULT_APPLICATION_FEE_PERCENT = 10;
export const DEFAULT_WITHHOLDING_TAX_PERCENT = 21;

export async function getApplicationFeePercent(
  db: ReturnType<typeof getDb>,
  brokerUserId: string
): Promise<number> {
  const [override] = await db
    .select({ feePercent: brokerFeeOverrides.feePercent })
    .from(brokerFeeOverrides)
    .where(eq(brokerFeeOverrides.userId, brokerUserId))
    .limit(1);

  return override ? override.feePercent : DEFAULT_APPLICATION_FEE_PERCENT;
}

export async function getWithholdingTaxPercent(
  db: ReturnType<typeof getDb>
): Promise<number> {
  const [row] = await db
    .select({ value: platformSettings.value })
    .from(platformSettings)
    .where(eq(platformSettings.key, "withholdingTaxPercent"))
    .limit(1);

  const parsed = Number(row?.value);
  return Number.isFinite(parsed) ? parsed : DEFAULT_WITHHOLDING_TAX_PERCENT;
}
