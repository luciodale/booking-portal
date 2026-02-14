import type { getDb } from "@/db";
import { brokers } from "@/db/schema";
import { requireAuth } from "@/modules/auth/auth";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";

/**
 * Resolves the brokerId for the authenticated user by looking up the brokers table.
 * Throws if the user is not authenticated or has no broker record.
 */
export function resolveBrokerId(
  locals: APIContext["locals"],
  db: ReturnType<typeof getDb>
) {
  const auth = requireAuth(locals);

  return db
    .select({ id: brokers.id })
    .from(brokers)
    .where(eq(brokers.clerkUserId, auth.clerkUserId))
    .limit(1)
    .then(([broker]) => {
      if (!broker) {
        throw new Error("No broker account found for this user");
      }
      return broker.id;
    });
}
