import { getDb } from "@/db";
import { assets, bookings, brokerLogs, pmsIntegrations } from "@/db/schema";
import { createSmoobuBooking } from "@/features/broker/pms/integrations/smoobu/server-service/POSTCreateBooking";
import { getStripeKeys } from "@/features/public/booking/stripe-config";
import { createEventLogger } from "@/modules/logging/eventLogger";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import Stripe from "stripe";

const SMOOBU_CHANNEL_ID = 70;

export const POST: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime?.env?.DB;
  const { secretKey: stripeKey, webhookSecret } = getStripeKeys(locals.runtime?.env ?? {} as Env);

  if (!stripeKey || !webhookSecret || !D1Database) {
    return new Response("Server misconfigured", { status: 503 });
  }

  const log = createEventLogger(D1Database);
  const stripe = new Stripe(stripeKey);
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    log.error({
      source: "stripe-webhook",
      message: "Webhook signature verification failed",
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
    return new Response("Invalid signature", { status: 400 });
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
    // Look up booking by stripe session ID
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.stripeSessionId, session.id))
      .limit(1);

    if (!booking) {
      console.error(`No booking found for stripe session: ${session.id}`);
      log.error({
        source: "stripe-webhook",
        message: `No booking found for stripe session: ${session.id}`,
        metadata: { stripeSessionId: session.id },
      });
      return new Response("OK", { status: 200 });
    }

    // Idempotency: skip if already confirmed
    if (booking.status === "confirmed") {
      return new Response("OK", { status: 200 });
    }

    // Update booking status
    await db
      .update(bookings)
      .set({
        status: "confirmed",
        stripePaymentIntentId: session.payment_intent as string | null,
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookings.id, booking.id));

    // Fetch asset + integration for Smoobu booking creation
    const [asset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, booking.assetId))
      .limit(1);

    if (!asset?.smoobuPropertyId) {
      console.error(
        `Asset ${booking.assetId} not found or missing smoobuPropertyId`
      );
      log.error({
        source: "stripe-webhook",
        message: `Asset ${booking.assetId} not found or missing smoobuPropertyId`,
        metadata: { bookingId: booking.id, assetId: booking.assetId },
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
      log.error({
        source: "stripe-webhook",
        message: `No Smoobu integration for user ${asset.userId}`,
        metadata: { bookingId: booking.id, userId: asset.userId },
      });
      return new Response("OK", { status: 200 });
    }

    // Create Smoobu reservation
    const metadata = session.metadata ?? {};
    try {
      const smoobuResult = await createSmoobuBooking(integration.apiKey, {
        arrivalDate: booking.checkIn,
        departureDate: booking.checkOut,
        channelId: SMOOBU_CHANNEL_ID,
        apartmentId: asset.smoobuPropertyId,
        firstName: metadata.guestFirstName,
        lastName: metadata.guestLastName,
        email: metadata.guestEmail,
        phone: metadata.guestPhone || undefined,
        adults: metadata.adults ? Number(metadata.adults) : undefined,
        children: metadata.children ? Number(metadata.children) : undefined,
        notice: booking.guestNote ?? undefined,
        price: booking.totalPrice / 100,
        priceStatus: 1,
      });

      // Update booking with Smoobu reservation ID
      await db
        .update(bookings)
        .set({
          smoobuReservationId: smoobuResult.id,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(bookings.id, booking.id));

      log.info({
        source: "stripe-webhook",
        message: `Booking ${booking.id} confirmed, Smoobu reservation ${smoobuResult.id} created`,
        metadata: {
          bookingId: booking.id,
          smoobuReservationId: smoobuResult.id,
          stripeSessionId: session.id,
        },
      });

      // Log success
      await db.insert(brokerLogs).values({
        id: nanoid(),
        userId: asset.userId,
        eventType: "smoobu_booking_success",
        relatedEntityId: booking.id,
        message: `Smoobu reservation ${smoobuResult.id} created for booking ${booking.id}`,
        metadata: {
          smoobuReservationId: smoobuResult.id,
          stripeSessionId: session.id,
        },
      });
    } catch (smoobuError) {
      console.error("Smoobu booking creation failed:", smoobuError);
      log.error({
        source: "stripe-webhook",
        message: `Smoobu booking creation failed for booking ${booking.id}: ${smoobuError instanceof Error ? smoobuError.message : "Unknown error"}`,
        metadata: { bookingId: booking.id, stripeSessionId: session.id },
      });

      // Log failure
      await db.insert(brokerLogs).values({
        id: nanoid(),
        userId: asset.userId,
        eventType: "smoobu_booking_failure",
        relatedEntityId: booking.id,
        message: `Failed to create Smoobu reservation for booking ${booking.id}: ${smoobuError instanceof Error ? smoobuError.message : "Unknown error"}`,
        metadata: { stripeSessionId: session.id },
      });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal error", { status: 500 });
  }
};
