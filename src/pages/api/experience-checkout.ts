import { getDb } from "@/db";
import { experiences } from "@/db/schema";
import { computeExperienceAdditionalCosts } from "@/features/public/booking/domain/computeAdditionalCosts";
import { requireAuth } from "@/modules/auth/auth";
import { createEventLogger } from "@/modules/logging/eventLogger";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { safeErrorMessage } from "@/features/broker/property/api/server-handler/responseHelpers";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import { localePath } from "@/i18n/locale-path";
import type { Locale } from "@/i18n/types";
import { z } from "zod";
import { resolveConnectAccount } from "@/features/broker/connect/domain/resolveConnectAccount";
import { getApplicationFeePercent } from "@/features/admin/settings/domain/getApplicationFeePercent";

const bodySchema = z.object({
  experienceId: z.string().min(1),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  participants: z.number().int().min(1),
  currency: z.string().min(1),
  guestInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    guestNote: z.string().optional(),
  }),
  locale: z.string().optional(),
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const authContext = requireAuth(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database)
      return jsonResponse({ error: "Database not available" }, 503);

    const stripeKey = locals.runtime?.env?.STRIPE_SECRET_KEY;
    if (!stripeKey)
      return jsonResponse({ error: "Stripe not configured" }, 503);

    const log = createEventLogger(D1Database);

    const body = bodySchema.safeParse(await request.json());
    if (!body.success) {
      return jsonResponse(
        { error: "Invalid request", details: body.error.issues },
        400
      );
    }

    const { experienceId, bookingDate, participants, currency, guestInfo, locale: bodyLocale } =
      body.data;
    const locale: Locale = (bodyLocale as Locale) ?? getRequestLocale(request);
    const db = getDb(D1Database);

    // Fetch experience
    const [experience] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, experienceId))
      .limit(1);

    if (!experience || experience.status !== "published") {
      return jsonResponse({ error: t(locale, "error.experienceNotFound") }, 404);
    }

    if (!experience.instantBook) {
      return jsonResponse(
        { error: t(locale, "error.experienceNotBookable") },
        400
      );
    }

    if (
      experience.maxParticipants &&
      participants > experience.maxParticipants
    ) {
      return jsonResponse(
        {
          error: t(locale, "error.maxParticipants", { count: experience.maxParticipants }),
        },
        400
      );
    }

    // Verify broker has completed Stripe Connect onboarding
    const connectedAccountId = await resolveConnectAccount(
      db,
      experience.userId
    );
    if (!connectedAccountId) {
      return jsonResponse(
        { error: "This experience's host hasn't set up payouts yet" },
        400
      );
    }

    // Compute total price server-side
    const baseTotalCents = experience.basePrice * participants;
    const additionalCostItems = computeExperienceAdditionalCosts(
      experience.additionalCosts ?? null,
      { participants, currency: currency.toLowerCase() }
    );
    const additionalTotalCents = additionalCostItems.reduce(
      (sum, item) => sum + item.amountCents,
      0
    );
    const totalPriceCents = baseTotalCents + additionalTotalCents;

    // Compute application fee for Stripe Connect
    const feePercent = await getApplicationFeePercent(db);
    const applicationFeeAmount = Math.round(
      (totalPriceCents * feePercent) / 100
    );

    const origin = new URL(request.url).origin;

    const metadata = {
      type: "experience",
      experienceId,
      userId: authContext.userId,
      bookingDate,
      participants: String(participants),
      currency: currency.toLowerCase(),
      totalPriceCents: String(totalPriceCents),
      guestFirstName: guestInfo.firstName,
      guestLastName: guestInfo.lastName,
      guestEmail: guestInfo.email,
      guestPhone: guestInfo.phone ?? "",
      guestNote: guestInfo.guestNote ?? "",
      applicationFeeAmount: String(applicationFeeAmount),
    };

    // ── Dev mode: skip Stripe, fire webhook via mock server ───────────────
    if (import.meta.env.DEV) {
      const mockSessionId = `mock_${Date.now()}`;
      const mockRes = await fetch(
        `${import.meta.env.SMOOBU_BASE_URL}/mock/trigger-webhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata, sessionId: mockSessionId }),
        }
      );

      if (!mockRes.ok) {
        return jsonResponse({ error: "Mock webhook failed" }, 502);
      }

      log.info({
        source: "experience-checkout",
        message: "Dev checkout — mock webhook fired",
        metadata: { experienceId },
      });

      return jsonResponse({
        url: `${origin}${localePath(locale, "/booking/experience-success")}?session_id=${mockSessionId}`,
      });
    }

    // ── Production: create Stripe Checkout Session ────────────────────────
    const stripe = new Stripe(stripeKey);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: experience.basePrice,
          product_data: {
            name: experience.title,
            description: `${bookingDate} · ${participants} participant${participants !== 1 ? "s" : ""}`,
          },
        },
        quantity: participants,
      },
      ...additionalCostItems.map((item) => ({
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: item.amountCents,
          product_data: {
            name: item.label,
            ...(item.detail ? { description: item.detail } : {}),
          },
        },
        quantity: 1,
      })),
    ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: guestInfo.email,
      line_items: lineItems,
      metadata,
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: connectedAccountId,
        },
      },
      success_url: `${origin}${localePath(locale, "/booking/experience-success")}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${localePath(locale, `/experiences/${experienceId}`)}`,
    });

    log.info({
      source: "experience-checkout",
      message: "Experience checkout session created",
      metadata: { experienceId, stripeSessionId: session.id },
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error("Experience checkout error:", error);
    const locale: Locale = getRequestLocale(request);
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonResponse({ error: t(locale, "error.signInRequired") }, 401);
    }
    const D1 = locals.runtime?.env?.DB;
    if (D1) {
      createEventLogger(D1).error({
        source: "experience-checkout",
        message: `Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
    return jsonResponse(
      { error: safeErrorMessage(error, t(locale, "error.checkoutFailed")) },
      500
    );
  }
};
