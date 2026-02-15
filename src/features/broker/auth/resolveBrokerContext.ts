import type { getDb } from "@/db";
import { users } from "@/db/schema";
import { type AuthContext, checkRole, requireAuth } from "@/modules/auth/auth";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";

export interface BrokerContext {
  auth: AuthContext;
  userId: string | null;
  isAdmin: boolean;
}

export async function resolveBrokerContext(
  locals: APIContext["locals"],
  db: ReturnType<typeof getDb>
): Promise<BrokerContext> {
  const auth = requireAuth(locals);
  const isAdmin = checkRole(auth, "admin");

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);

  if (!user && !isAdmin) {
    throw new Error("Forbidden: No user account");
  }

  return {
    auth,
    userId: user?.id ?? null,
    isAdmin,
  };
}
