import { getDb } from "@/db";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import { resolveConnectAccount } from "@/features/broker/connect/domain/resolveConnectAccount";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIContext } from "astro";
import Stripe from "stripe";

export async function POSTCreateLoginLink(locals: APIContext["locals"]) {
  try {
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) return jsonError("Database not available", 503);

    const stripeKey = locals.runtime?.env?.STRIPE_SECRET_KEY;
    if (!stripeKey) return jsonError("Stripe not configured", 503);

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    if (!ctx.userId) return jsonError("No user account", 403);

    const accountId = await resolveConnectAccount(db, ctx.userId);
    if (!accountId) {
      return jsonError("No connected account found", 400);
    }

    const stripe = new Stripe(stripeKey);
    const loginLink = await stripe.accounts.createLoginLink(accountId);

    return jsonSuccess({ url: loginLink.url });
  } catch (error) {
    console.error("[POSTCreateLoginLink]", error);
    return jsonError("Internal error", mapErrorToStatus(error));
  }
}
