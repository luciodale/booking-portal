import { getDb } from "@/db";
import {
  assets,
  bookings,
  brokerLogs,
  experienceBookings,
  pmsIntegrations,
  users,
} from "@/db/schema";
import { SmoobuApiError } from "@/features/broker/pms/integrations/smoobu/SmoobuApiError";
import { createSmoobuBooking } from "@/features/broker/pms/integrations/smoobu/server-service/POSTCreateBooking";
import { createEventLogger } from "@/modules/logging/eventLogger";
import { centsToUnit } from "@/modules/money/money";
import { sanitizeFreeText } from "@/modules/sanitize/text";
import {
  type PropertyBookingMeta,
  experienceBookingMetaSchema,
  propertyBookingMetaSchema,
} from "@/schemas/stripeWebhook";
import type { APIRoute } from "astro";
import { and, eq, gt, lt } from "drizzle-orm";
import { nanoid } from "nanoid";
import Stripe from "stripe";

const SMOOBU_CHANNEL_ID = 70;

export const POST: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime?.env?.DB;
  const stripeKey = locals.runtime?.env?.STRIPE_SECRET_KEY;
  const webhookSecret = locals.runtime?.env?.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret || !D1Database) {
    return new Response("Server misconfigured", { status: 503 });
  }

  const log = createEventLogger(D1Database);
  const body = await request.text();

  const stripe = new Stripe(stripeKey);
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    await log.error({
      source: "stripe-webhook",
      message: "Webhook signature verification failed",
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
    return new Response("Invalid signature", { status: 400 });
  }

  // ── charge.refunded fallback ──────────────────────────────────────────
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (paymentIntentId) {
      const db = getDb(D1Database);
      const [booking] = await db
        .select({ id: bookings.id, status: bookings.status })
        .from(bookings)
        .where(eq(bookings.stripePaymentIntentId, paymentIntentId))
        .limit(1);

      if (booking && booking.status !== "cancelled") {
        await db
          .update(bookings)
          .set({
            status: "cancelled",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(bookings.id, booking.id));

        await log.info({
          source: "stripe-webhook",
          message: `Booking ${booking.id} marked cancelled via charge.refunded`,
          metadata: { bookingId: booking.id, paymentIntentId },
        });
      }
    }
    return new Response("OK", { status: 200 });
  }

  // ── account.updated ───────────────────────────────────────────────────
  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    const db = getDb(D1Database);

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.stripeConnectedAccountId, account.id))
      .limit(1);

    if (user) {
      const stripeSetupComplete =
        (account.charges_enabled ?? false) &&
        (account.payouts_enabled ?? false);

      await db
        .update(users)
        .set({
          stripeSetupComplete,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, user.id));

      await log.info({
        source: "stripe-webhook",
        message: `Connected account ${account.id} updated`,
        metadata: {
          userId: user.id,
          accountId: account.id,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted,
          stripeSetupComplete,
        },
      });
    }
    return new Response("OK", { status: 200 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return new Response("OK", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const db = getDb(D1Database);
  const rawMeta = session.metadata ?? {};

  try {
    // ── Experience booking branch ─────────────────────────────────────────
    if (rawMeta.type === "experience") {
      const parsed = experienceBookingMetaSchema.safeParse(rawMeta);
      if (!parsed.success) {
        await log.error({
          source: "stripe-webhook",
          message: "Experience booking metadata invalid",
          metadata: {
            stripeSessionId: session.id,
            issues: parsed.error.issues,
          },
        });
        // 400 prevents Stripe retries for malformed metadata.
        return new Response("Invalid metadata", { status: 400 });
      }
      const meta = parsed.data;

      // Idempotency: pre select rather than relying on UNIQUE error message.
      const [existing] = await db
        .select({ id: experienceBookings.id })
        .from(experienceBookings)
        .where(eq(experienceBookings.stripeSessionId, session.id))
        .limit(1);

      if (existing) return new Response("OK", { status: 200 });

      const expBookingId = nanoid();
      await db.insert(experienceBookings).values({
        id: expBookingId,
        experienceId: meta.experienceId,
        userId: meta.userId,
        bookingDate: meta.bookingDate,
        participants: meta.participants,
        totalPrice: meta.totalPriceCents,
        currency: meta.currency ?? "eur",
        status: "confirmed",
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        paidAt: new Date().toISOString(),
        firstName: sanitizeFreeText(meta.guestFirstName, 120) ?? "",
        lastName: sanitizeFreeText(meta.guestLastName, 120) ?? "",
        email: meta.guestEmail ?? "",
        phone: sanitizeFreeText(meta.guestPhone, 40),
        guestNote: sanitizeFreeText(meta.guestNote, 2000),
      });

      await log.info({
        source: "stripe-webhook",
        message: `Experience booking ${expBookingId} confirmed`,
        metadata: {
          experienceBookingId: expBookingId,
          experienceId: meta.experienceId,
          stripeSessionId: session.id,
        },
      });

      return new Response("OK", { status: 200 });
    }

    // ── Property booking branch ───────────────────────────────────────────
    const parsedProperty = propertyBookingMetaSchema.safeParse(rawMeta);
    if (!parsedProperty.success) {
      await log.error({
        source: "stripe-webhook",
        message: "Property booking metadata invalid",
        metadata: {
          stripeSessionId: session.id,
          issues: parsedProperty.error.issues,
        },
      });
      return new Response("Invalid metadata", { status: 400 });
    }
    const meta = parsedProperty.data;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null;

    // ── Idempotency check ───────────────────────────────────────────────
    // Pre select rather than catching a UNIQUE constraint error string. This
    // is resilient to driver / version changes and lets us know whether to
    // resume sync, return OK, or do nothing.
    const [existing] = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        smoobuReservationId: bookings.smoobuReservationId,
      })
      .from(bookings)
      .where(eq(bookings.stripeSessionId, session.id))
      .limit(1);

    if (existing && existing.status === "confirmed") {
      return new Response("OK", { status: 200 });
    }
    if (existing && existing.status === "cancelled") {
      return new Response("OK", { status: 200 });
    }

    // ── Connect account drift check ──────────────────────────────────────
    // Re-verify the broker is still able to accept charges/payouts at the
    // time of webhook processing. The checkout flow checked this earlier
    // but state can flip in between.
    const [propertyAsset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, meta.propertyId))
      .limit(1);

    if (!propertyAsset) {
      await log.error({
        source: "stripe-webhook",
        message: `Asset ${meta.propertyId} not found at webhook time`,
        metadata: { stripeSessionId: session.id, propertyId: meta.propertyId },
      });
      // Refund and stop. The asset disappeared between checkout and webhook
      // which is unrecoverable without manual intervention.
      if (paymentIntentId) {
        try {
          await stripe.refunds.create({ payment_intent: paymentIntentId });
        } catch (refundErr) {
          await log.error({
            source: "stripe-webhook",
            message: "Refund for missing asset failed",
            metadata: {
              paymentIntentId,
              error:
                refundErr instanceof Error
                  ? refundErr.message
                  : String(refundErr),
            },
          });
        }
      }
      return new Response("OK", { status: 200 });
    }

    const [broker] = await db
      .select({
        id: users.id,
        stripeSetupComplete: users.stripeSetupComplete,
        stripeConnectedAccountId: users.stripeConnectedAccountId,
      })
      .from(users)
      .where(eq(users.id, propertyAsset.userId))
      .limit(1);

    if (
      !broker ||
      !broker.stripeSetupComplete ||
      !broker.stripeConnectedAccountId
    ) {
      await log.error({
        source: "stripe-webhook",
        message: `Broker ${propertyAsset.userId} Connect setup incomplete at webhook time`,
        metadata: {
          stripeSessionId: session.id,
          brokerId: propertyAsset.userId,
        },
      });
      // Return 500 so Stripe retries — the broker may recover their Connect
      // account quickly. If not, manual operator intervention is required.
      return new Response("Broker payout state invalid", { status: 500 });
    }

    // ── Overlap check ────────────────────────────────────────────────────
    const [overlap] = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.assetId, meta.propertyId),
          eq(bookings.status, "confirmed"),
          lt(bookings.checkIn, meta.checkOut),
          gt(bookings.checkOut, meta.checkIn)
        )
      )
      .limit(1);

    if (overlap) {
      await log.error({
        source: "stripe-webhook",
        message: `Overlapping booking rejected for property ${meta.propertyId}`,
        metadata: {
          stripeSessionId: session.id,
          overlapBookingId: overlap.id,
        },
      });

      if (paymentIntentId) {
        try {
          await stripe.refunds.create({ payment_intent: paymentIntentId });
          await log.info({
            source: "stripe-webhook",
            message: `Auto refund issued for overlapping booking on property ${meta.propertyId}`,
            metadata: {
              paymentIntentId,
              overlapBookingId: overlap.id,
            },
          });
        } catch (refundErr) {
          await log.error({
            source: "stripe-webhook",
            message: "Auto refund failed for overlapping booking",
            metadata: {
              paymentIntentId,
              error:
                refundErr instanceof Error
                  ? refundErr.message
                  : String(refundErr),
            },
          });
        }
      }
      return new Response("Booking rejected: dates overlap", { status: 409 });
    }

    // ── Saga: insert as pending_pms, sync Smoobu, flip to confirmed ──────
    const bookingId = existing?.id ?? nanoid();

    if (!existing) {
      await db.insert(bookings).values({
        id: bookingId,
        assetId: meta.propertyId,
        userId: meta.userId,
        checkIn: meta.checkIn,
        checkOut: meta.checkOut,
        nights: meta.nights,
        guests: meta.guests,
        baseTotal: meta.nightlyTotalCents,
        additionalCostsCents: meta.additionalCostsCents,
        extrasCents: meta.extrasCents,
        cityTaxCents: meta.cityTaxCents,
        platformFeeCents: meta.platformFeeCents,
        withholdingTaxCents: meta.withholdingTaxCents,
        totalPrice: meta.totalPriceCents,
        currency: meta.currency ?? "eur",
        status: "pending_pms",
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date().toISOString(),
        guestNote: sanitizeFreeText(meta.guestNote, 2000),
      });
    }

    return await syncSmoobuAndConfirm({
      db,
      stripe,
      log,
      meta,
      bookingId,
      paymentIntentId,
      stripeSessionId: session.id,
      asset: propertyAsset,
    });
  } catch (error) {
    await log.error({
      source: "stripe-webhook",
      message: `Webhook processing error: ${error instanceof Error ? error.message : "Unknown"}`,
      metadata: {
        eventType: event.type,
        stripeSessionId: session.id,
      },
    });
    return new Response("Internal error", { status: 500 });
  }
};

type SyncContext = {
  db: ReturnType<typeof getDb>;
  stripe: Stripe;
  log: ReturnType<typeof createEventLogger>;
  meta: PropertyBookingMeta;
  bookingId: string;
  paymentIntentId: string | null;
  stripeSessionId: string;
  asset: typeof assets.$inferSelect;
};

async function syncSmoobuAndConfirm(ctx: SyncContext): Promise<Response> {
  const {
    db,
    stripe,
    log,
    meta,
    bookingId,
    paymentIntentId,
    stripeSessionId,
    asset,
  } = ctx;

  if (!asset.smoobuPropertyId) {
    await log.error({
      source: "stripe-webhook",
      message: `Asset ${asset.id} missing smoobuPropertyId`,
      metadata: { bookingId, assetId: asset.id },
    });
    return new Response("OK", { status: 200 });
  }

  const [integration] = await db
    .select()
    .from(pmsIntegrations)
    .where(eq(pmsIntegrations.userId, asset.userId))
    .limit(1);

  if (!integration || integration.provider !== "smoobu") {
    await log.error({
      source: "stripe-webhook",
      message: `No Smoobu integration for broker ${asset.userId}`,
      metadata: { bookingId, brokerId: asset.userId },
    });
    return new Response("OK", { status: 200 });
  }

  try {
    const smoobuResult = await createSmoobuBooking(integration.apiKey, {
      arrivalDate: meta.checkIn,
      departureDate: meta.checkOut,
      channelId: SMOOBU_CHANNEL_ID,
      apartmentId: asset.smoobuPropertyId,
      firstName: meta.guestFirstName,
      lastName: meta.guestLastName,
      email: meta.guestEmail,
      phone: meta.guestPhone || undefined,
      adults: meta.adults,
      children: meta.children,
      notice: meta.guestNote || undefined,
      price: centsToUnit(meta.totalPriceCents),
      priceStatus: 1,
    });

    // Saga step: only flip to confirmed once Smoobu has accepted.
    await db
      .update(bookings)
      .set({
        status: "confirmed",
        smoobuReservationId: smoobuResult.id,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookings.id, bookingId));

    await log.info({
      source: "stripe-webhook",
      message: `Booking ${bookingId} confirmed, Smoobu reservation ${smoobuResult.id} created`,
      metadata: {
        bookingId,
        smoobuReservationId: smoobuResult.id,
        stripeSessionId,
      },
    });

    await db.insert(brokerLogs).values({
      id: nanoid(),
      userId: asset.userId,
      eventType: "smoobu_booking_success",
      relatedEntityId: bookingId,
      message: `Smoobu reservation ${smoobuResult.id} created for booking ${bookingId}`,
      metadata: {
        smoobuReservationId: smoobuResult.id,
        stripeSessionId,
      },
    });

    return new Response("OK", { status: 200 });
  } catch (smoobuError) {
    const errMsg =
      smoobuError instanceof Error ? smoobuError.message : "Unknown error";

    await log.error({
      source: "stripe-webhook",
      message: `Smoobu booking creation failed for booking ${bookingId}: ${errMsg}`,
      metadata: { bookingId, stripeSessionId },
    });

    if (smoobuError instanceof SmoobuApiError && smoobuError.retryable) {
      // Transient. Booking remains in pending_pms. Stripe will retry the
      // webhook. If retries exhaust, an operator can call the resync
      // endpoint or cancel manually.
      return new Response("Smoobu temporarily unavailable", { status: 500 });
    }

    // Permanent failure. Cancel booking and refund.
    await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date().toISOString() })
      .where(eq(bookings.id, bookingId));

    if (paymentIntentId) {
      try {
        await stripe.refunds.create({ payment_intent: paymentIntentId });
        await log.info({
          source: "stripe-webhook",
          message: `Auto refund issued for failed booking ${bookingId}`,
          metadata: { bookingId, paymentIntentId },
        });
      } catch (refundError) {
        await log.error({
          source: "stripe-webhook",
          message: `Auto refund failed for booking ${bookingId}`,
          metadata: {
            bookingId,
            paymentIntentId,
            error:
              refundError instanceof Error
                ? refundError.message
                : String(refundError),
          },
        });
        return new Response("Refund failed, retry needed", { status: 500 });
      }
    }

    await db.insert(brokerLogs).values({
      id: nanoid(),
      userId: asset.userId,
      eventType: "smoobu_booking_failure",
      relatedEntityId: bookingId,
      message: `Failed to create Smoobu reservation for booking ${bookingId}: ${errMsg}`,
      metadata: { stripeSessionId },
    });

    return new Response("OK", { status: 200 });
  }
}
