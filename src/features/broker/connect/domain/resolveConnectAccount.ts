import type { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function resolveConnectAccount(
  db: ReturnType<typeof getDb>,
  userId: string
): Promise<string | null> {
  const [user] = await db
    .select({ stripeConnectedAccountId: users.stripeConnectedAccountId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.stripeConnectedAccountId ?? null;
}
