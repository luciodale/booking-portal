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

    const [booking] = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        checkIn: bookings.checkIn,
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

    if (!ctx.isAdmin && booking.assetUserId !== ctx.userId) {
      return jsonError(t(locale, "error.forbiddenNotYourProperty"), 403);
    }

    if (booking.status !== "confirmed") {
      return jsonError(
        t(locale, "error.cannotCancelBooking", { status: booking.status }),
        400
      );
    }

    // 48h cancellation cutoff. Using property local interpretation of the
    // check in date (YYYY-MM-DD anchored to noon UTC) avoids edge of day
    // ambiguities while we operate in a single timezone (IT).
    const MIN_CANCEL_HOURS = 48;
    const [y, m, d] = booking.checkIn.split("-").map(Number);
    const checkInMs = Date.UTC(y, m - 1, d, 12);
    const hoursUntilCheckIn = (checkInMs - Date.now()) / (1000 * 60 * 60);

    if (!ctx.isAdmin && hoursUntilCheckIn < MIN_CANCEL_HOURS) {
      return jsonError(
        t(locale, "error.cancellationTooLate", {
          hours: MIN_CANCEL_HOURS,
        }),
        400
      );
    }

    if (!stripeKey) {
      return jsonError(t(locale, "error.stripeNotConfigured"), 503);
    }

    // Cancellation order: Smoobu first, Stripe refund second, DB status flip
    // last. If Smoobu cancel fails the broker keeps a confirmed PMS booking
    // matched by the still confirmed DB row, instead of an unrefundable
    // booking. The DB transition only happens after both sides settle.
    if (booking.smoobuReservationId) {
      const [integration] = await db
        .select({ apiKey: pmsIntegrations.apiKey })
        .from(pmsIntegrations)
        .where(eq(pmsIntegrations.userId, booking.assetUserId))
        .limit(1);

      if (!integration) {
        await log.error({
          source: "cancel-booking",
          message: `Missing PMS integration during cancel of booking ${bookingId}`,
          metadata: { bookingId },
        });
        return jsonError(t(locale, "error.failedToCancelBooking"), 500);
      }

      let smoobuRes: Response;
      try {
        smoobuRes = await fetch(
          `https://login.smoobu.com/api/reservations/${booking.smoobuReservationId}`,
          {
            method: "DELETE",
            headers: { "Api-Key": integration.apiKey },
          }
        );
      } catch (smoobuErr) {
        await log.error({
          source: "cancel-booking",
          message: `Smoobu cancel network error for reservation ${booking.smoobuReservationId}`,
          metadata: {
            bookingId,
            error:
              smoobuErr instanceof Error
                ? smoobuErr.message
                : String(smoobuErr),
          },
        });
        return jsonError(t(locale, "error.failedToCancelBooking"), 503);
      }

      // 404 is treated as already gone — proceed.
      if (!smoobuRes.ok && smoobuRes.status !== 404) {
        await log.error({
          source: "cancel-booking",
          message: `Smoobu cancel returned ${smoobuRes.status} for reservation ${booking.smoobuReservationId}`,
          metadata: { bookingId, smoobuStatus: smoobuRes.status },
        });
        const retryable = smoobuRes.status >= 500 || smoobuRes.status === 429;
        return jsonError(
          t(locale, "error.failedToCancelBooking"),
          retryable ? 503 : 502
        );
      }

      await log.info({
        source: "cancel-booking",
        message: `Smoobu reservation ${booking.smoobuReservationId} cancelled`,
        metadata: { bookingId },
      });
    }

    if (booking.stripePaymentIntentId) {
      const stripe = new Stripe(stripeKey);
      try {
        await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
        });
      } catch (refundErr) {
        await log.error({
          source: "cancel-booking",
          message: `Stripe refund failed for booking ${bookingId}`,
          metadata: {
            bookingId,
            paymentIntentId: booking.stripePaymentIntentId,
            error:
              refundErr instanceof Error
                ? refundErr.message
                : String(refundErr),
          },
        });
        // PMS has already cancelled the reservation. We cannot leave the DB
        // in confirmed because it would mismatch PMS. We flip to cancelled
        // and require operator intervention for the refund.
        await db
          .update(bookings)
          .set({
            status: "cancelled",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(bookings.id, bookingId));
        return jsonError(t(locale, "error.refundFailedRetryRequired"), 502);
      }

      await log.info({
        source: "cancel-booking",
        message: `Stripe refund issued for booking ${bookingId}`,
        metadata: {
          bookingId,
          paymentIntentId: booking.stripePaymentIntentId,
        },
      });
    }

    await db
      .update(bookings)
      .set({
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookings.id, bookingId));

    await log.info({
      source: "cancel-booking",
      message: `Booking ${bookingId} cancelled`,
      metadata: { bookingId, cancelledBy: ctx.userId },
    });

    return jsonSuccess({ bookingId, status: "cancelled" });
  } catch (error) {
    return jsonError(
      safeErrorMessage(error, t(locale, "error.failedToCancelBooking"), locale),
      mapErrorToStatus(error)
    );
  }
};
