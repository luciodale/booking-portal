import { getDb } from "@/db";
import { assets, bookings, pmsIntegrations } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import { createEventLogger } from "@/modules/logging/eventLogger";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export const POST: APIRoute = async ({ params, request, locals }) => {
  const locale = getRequestLocale(request);
  const D1Database = locals.runtime?.env?.DB;
  const stripeKey = locals.runtime?.env?.STRIPE_SECRET_KEY;

  if (!D1Database) {
    return jsonError(t(locale, "error.dbNotAvailable"), 503);
  }

  const log = createEventLogger(D1Database);

  try {
    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);
    const bookingId = params.id;

    if (!bookingId) {
      return jsonError(t(locale, "error.missingBookingId"), 400);
    }

    // Fetch booking with asset ownership check
    const [booking] = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        stripePaymentIntentId: bookings.stripePaymentIntentId,
        smoobuReservationId: bookings.smoobuReservationId,
        assetId: bookings.assetId,
        assetUserId: assets.userId,
      })
      .from(bookings)
      .innerJoin(assets, eq(bookings.assetId, assets.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return jsonError(t(locale, "error.bookingNotFound"), 404);
    }

    // Ownership check
    if (!ctx.isAdmin && booking.assetUserId !== ctx.userId) {
      return jsonError(t(locale, "error.forbiddenNotYourProperty"), 403);
    }

    if (booking.status !== "confirmed") {
      return jsonError(
        t(locale, "error.cannotCancelBooking", { status: booking.status }),
        400
      );
    }

    // Stripe refund
    if (!import.meta.env.DEV) {
      if (!stripeKey) {
        return jsonError(t(locale, "error.stripeNotConfigured"), 503);
      }

      if (booking.stripePaymentIntentId) {
        const stripe = new Stripe(stripeKey);
        await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
        });

        log.info({
          source: "cancel-booking",
          message: `Stripe refund issued for booking ${bookingId}`,
          metadata: {
            bookingId,
            paymentIntentId: booking.stripePaymentIntentId,
          },
        });
      }
    }

    // Smoobu cancel
    if (booking.smoobuReservationId) {
      const [integration] = await db
        .select({ apiKey: pmsIntegrations.apiKey })
        .from(pmsIntegrations)
        .where(eq(pmsIntegrations.userId, booking.assetUserId))
        .limit(1);

      if (integration) {
        try {
          const smoobuRes = await fetch(
            `https://login.smoobu.com/api/reservations/${booking.smoobuReservationId}`,
            {
              method: "DELETE",
              headers: { "Api-Key": integration.apiKey },
            }
          );

          if (!smoobuRes.ok) {
            log.warn({
              source: "cancel-booking",
              message: `Smoobu cancel returned ${smoobuRes.status} for reservation ${booking.smoobuReservationId}`,
              metadata: { bookingId, smoobuStatus: smoobuRes.status },
            });
          } else {
            log.info({
              source: "cancel-booking",
              message: `Smoobu reservation ${booking.smoobuReservationId} cancelled`,
              metadata: { bookingId },
            });
          }
        } catch (smoobuErr) {
          log.error({
            source: "cancel-booking",
            message: `Smoobu cancel failed for reservation ${booking.smoobuReservationId}: ${smoobuErr instanceof Error ? smoobuErr.message : "Unknown"}`,
            metadata: { bookingId },
          });
        }
      }
    }

    // Update booking status
    await db
      .update(bookings)
      .set({
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookings.id, bookingId));

    log.info({
      source: "cancel-booking",
      message: `Booking ${bookingId} cancelled by broker`,
      metadata: { bookingId, cancelledBy: ctx.userId },
    });

    return jsonSuccess({ bookingId, status: "cancelled" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return jsonError(
      safeErrorMessage(error, t(locale, "error.failedToCancelBooking"), locale),
      mapErrorToStatus(error)
    );
  }
};
