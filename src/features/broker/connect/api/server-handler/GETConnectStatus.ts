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

export type ConnectStatus = {
  status: "not_started" | "incomplete" | "complete";
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
};

export async function GETConnectStatus(locals: APIContext["locals"]) {
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
      return jsonSuccess<ConnectStatus>({
        status: "not_started",
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
    }

    const stripe = new Stripe(stripeKey);
    const account = await stripe.accounts.retrieve(
      user.stripeConnectedAccountId
    );

    const chargesEnabled = account.charges_enabled ?? false;
    const payoutsEnabled = account.payouts_enabled ?? false;
    const detailsSubmitted = account.details_submitted ?? false;

    const status: ConnectStatus["status"] =
      chargesEnabled && payoutsEnabled ? "complete" : "incomplete";

    return jsonSuccess<ConnectStatus>({
      status,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Internal error",
      mapErrorToStatus(error)
    );
  }
}
