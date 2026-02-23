import { getDb } from "@/db";
import { users } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POSTCreateAccountSession(
  locals: APIContext["locals"]
) {
  try {
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const stripeKey = locals.runtime?.env?.STRIPE_SECRET_KEY;
    if (!stripeKey) return jsonError("Stripe not configured", 503);

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    if (!ctx.userId) return jsonError("No user account", 403);

    const [user] = await db
      .select({ stripeConnectedAccountId: users.stripeConnectedAccountId })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);

    if (!user?.stripeConnectedAccountId) {
      return jsonError("No connected account. Create one first.", 400);
    }

    const stripe = new Stripe(stripeKey);
    const session = await stripe.accountSessions.create({
      account: user.stripeConnectedAccountId,
      components: {
        account_onboarding: { enabled: true },
      },
    });

    return jsonSuccess({ clientSecret: session.client_secret });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Internal error",
      mapErrorToStatus(error)
    );
  }
}
