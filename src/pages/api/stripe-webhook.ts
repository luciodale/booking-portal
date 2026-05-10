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
import { centsToUnit } from "@/modules/money/money";
import { createEventLogger } from "@/modules/logging/eventLogger";
import type { APIRoute } from "astro";
import { and, eq, lt, gt } from "drizzle-orm";
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
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
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

  // ── account.updated — log Connect account status changes ──────────────
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
        message: `Connected account ${account.id} updated: charges_enabled=${account.charges_enabled}, payouts_enabled=${account.payouts_enabled}`,
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

  try {
    const meta = session.metadata ?? {};

    // ── Experience booking ────────────────────────────────────────────────
    if (meta.type === "experience") {
      if (!meta.experienceId || !meta.userId || !meta.bookingDate) {
        await log.error({
          source: "stripe-webhook",
          message: "Experience booking missing required metadata",
          metadata: { stripeSessionId: session.id, meta },
        });
        return new Response("Missing metadata", { status: 400 });
      }

      const expBookingId = nanoid();
      try {
        await db.insert(experienceBookings).values({
          id: expBookingId,
          experienceId: meta.experienceId,
          userId: meta.userId,
          bookingDate: meta.bookingDate,
          participants: Number(meta.participants),
          totalPrice: Number(meta.totalPriceCents),
          currency: meta.currency ?? "eur",
          status: "confirmed",
          stripeSessionId: session.id,
          stripePaymentIntentId:
            (session.payment_intent as string) ?? null,
          paidAt: new Date().toISOString(),
          firstName: meta.guestFirstName ?? "",
          lastName: meta.guestLastName ?? "",
          email: meta.guestEmail ?? "",
          phone: meta.guestPhone || null,
          guestNote: meta.guestNote || null,
        });
      } catch (insertError) {
        const isDuplicate =
          insertError instanceof Error &&
          insertError.message.includes("UNIQUE constraint failed");
        if (isDuplicate) return new Response("OK", { status: 200 });
        throw insertError;
      }

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

    // ── Property booking (existing flow) ──────────────────────────────────
    if (
      !meta.propertyId ||
      !meta.userId ||
      !meta.checkIn ||
      !meta.checkOut
    ) {
      await log.error({
        source: "stripe-webhook",
        message: "Property booking missing required metadata",
        metadata: { stripeSessionId: session.id, meta },
      });
      return new Response("Missing metadata", { status: 400 });
    }

    // Check for overlapping confirmed bookings on same property
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
        message: `Overlapping booking rejected for property ${meta.propertyId} (${meta.checkIn} - ${meta.checkOut}), existing: ${overlap.id}`,
        metadata: { stripeSessionId: session.id, overlapBookingId: overlap.id },
      });

      const pi =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null;
      if (pi) {
        try {
          await stripe.refunds.create({ payment_intent: pi });
          await log.info({
            source: "stripe-webhook",
            message: `Auto-refund issued for overlapping booking on property ${meta.propertyId}`,
            metadata: { paymentIntentId: pi, overlapBookingId: overlap.id },
          });
        } catch (refundErr) {
          await log.error({
            source: "stripe-webhook",
            message: `Auto-refund failed for overlapping booking: ${refundErr instanceof Error ? refundErr.message : "Unknown"}`,
            metadata: { paymentIntentId: pi },
          });
        }
      }

      return new Response("Booking rejected: dates overlap", { status: 409 });
    }

    const bookingId = nanoid();
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null;

    function metaCents(key: string): number {
      const val = Number(meta[key]);
      if (!Number.isFinite(val)) {
        throw new Error(`Invalid or missing metadata value for "${key}"`);
      }
      return val;
    }

    try {
      await db.insert(bookings).values({
        id: bookingId,
        assetId: meta.propertyId,
        userId: meta.userId,
        checkIn: meta.checkIn,
        checkOut: meta.checkOut,
        nights: metaCents("nights"),
        guests: metaCents("guests"),
        baseTotal: metaCents("nightlyTotalCents"),
        additionalCostsCents: metaCents("additionalCostsCents"),
        extrasCents: metaCents("extrasCents"),
        cityTaxCents: metaCents("cityTaxCents"),
        platformFeeCents: metaCents("platformFeeCents"),
        withholdingTaxCents: metaCents("withholdingTaxCents"),
        totalPrice: metaCents("totalPriceCents"),
        currency: meta.currency ?? "eur",
        status: "confirmed",
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date().toISOString(),
        guestNote: meta.guestNote || null,
      });
    } catch (insertError) {
      const isDuplicate =
        insertError instanceof Error &&
        insertError.message.includes("UNIQUE constraint failed");
      if (isDuplicate) return new Response("OK", { status: 200 });
      throw insertError;
    }

    // Fetch asset + integration for Smoobu booking creation
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, meta.propertyId ?? ""))
      .limit(1);

    if (!asset?.smoobuPropertyId) {
      console.error(
        `Asset ${meta.propertyId} not found or missing smoobuPropertyId`
      );
      await log.error({
        source: "stripe-webhook",
        message: `Asset ${meta.propertyId} not found or missing smoobuPropertyId`,
        metadata: { bookingId, assetId: meta.propertyId },
      });
      return new Response("OK", { status: 200 });
    }

    const [integration] = await db
      .select()
      .from(pmsIntegrations)
      .where(eq(pmsIntegrations.userId, asset.userId))
      .limit(1);

    if (!integration || integration.provider !== "smoobu") {
      console.error(`No Smoobu integration for user ${asset.userId}`);
      await log.error({
        source: "stripe-webhook",
        message: `No Smoobu integration for user ${asset.userId}`,
        metadata: { bookingId, userId: asset.userId },
      });
      return new Response("OK", { status: 200 });
    }

    // Create Smoobu reservation
    try {
      const smoobuResult = await createSmoobuBooking(integration.apiKey, {
        arrivalDate: meta.checkIn ?? "",
        departureDate: meta.checkOut ?? "",
        channelId: SMOOBU_CHANNEL_ID,
        apartmentId: asset.smoobuPropertyId,
        firstName: meta.guestFirstName,
        lastName: meta.guestLastName,
        email: meta.guestEmail,
        phone: meta.guestPhone || undefined,
        adults: meta.adults ? Number(meta.adults) : undefined,
        children: meta.children ? Number(meta.children) : undefined,
        notice: meta.guestNote || undefined,
        price: centsToUnit(metaCents("totalPriceCents")),
        priceStatus: 1,
      });

      // Update booking with Smoobu reservation ID
      await db
        .update(bookings)
        .set({
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
          stripeSessionId: session.id,
        },
      });

      // Log success
      await db.insert(brokerLogs).values({
        id: nanoid(),
        userId: asset.userId,
        eventType: "smoobu_booking_success",
        relatedEntityId: bookingId,
        message: `Smoobu reservation ${smoobuResult.id} created for booking ${bookingId}`,
        metadata: {
          smoobuReservationId: smoobuResult.id,
          stripeSessionId: session.id,
        },
      });
    } catch (smoobuError) {
      const errMsg =
        smoobuError instanceof Error ? smoobuError.message : "Unknown error";
      console.error("Smoobu booking creation failed:", smoobuError);
      await log.error({
        source: "stripe-webhook",
        message: `Smoobu booking creation failed for booking ${bookingId}: ${errMsg}`,
        metadata: { bookingId, stripeSessionId: session.id },
      });

      // Transient Smoobu errors (429, 5xx): return 500 so Stripe retries
      if (
        smoobuError instanceof SmoobuApiError &&
        smoobuError.retryable
      ) {
        return new Response("Smoobu temporarily unavailable", {
          status: 500,
        });
      }

      // Permanent Smoobu error: cancel booking and refund
      await db
        .update(bookings)
        .set({ status: "cancelled", updatedAt: new Date().toISOString() })
        .where(eq(bookings.id, bookingId));

      if (paymentIntentId) {
        try {
          const stripe = new Stripe(stripeKey);
          await stripe.refunds.create({ payment_intent: paymentIntentId });
          await log.info({
            source: "stripe-webhook",
            message: `Auto-refund issued for failed booking ${bookingId}`,
            metadata: { bookingId, paymentIntentId },
          });
        } catch (refundError) {
          await log.error({
            source: "stripe-webhook",
            message: `Auto-refund failed for booking ${bookingId}: ${refundError instanceof Error ? refundError.message : "Unknown"}`,
            metadata: { bookingId, paymentIntentId },
          });
          return new Response("Refund failed, retry needed", {
            status: 500,
          });
        }
      }

      await db.insert(brokerLogs).values({
        id: nanoid(),
        userId: asset.userId,
        eventType: "smoobu_booking_failure",
        relatedEntityId: bookingId,
        message: `Failed to create Smoobu reservation for booking ${bookingId}: ${errMsg}`,
        metadata: { stripeSessionId: session.id },
      });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal error", { status: 500 });
  }
};
