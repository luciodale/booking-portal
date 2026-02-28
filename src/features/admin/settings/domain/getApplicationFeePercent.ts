import type { getDb } from "@/db";
import { brokerFeeOverrides } from "@/db/schema";
import { eq } from "drizzle-orm";

export const DEFAULT_APPLICATION_FEE_PERCENT = 10;

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
