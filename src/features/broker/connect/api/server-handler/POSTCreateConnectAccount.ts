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

export async function POSTCreateConnectAccount(
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

    // Check if already has a connected account
    const [user] = await db
      .select({ stripeConnectedAccountId: users.stripeConnectedAccountId })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);

    if (user?.stripeConnectedAccountId) {
      return jsonSuccess({ accountId: user.stripeConnectedAccountId });
    }

    const stripe = new Stripe(stripeKey);
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await db
      .update(users)
      .set({
        stripeConnectedAccountId: account.id,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, ctx.userId));

    return jsonSuccess({ accountId: account.id });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Internal error",
      mapErrorToStatus(error)
    );
  }
}
