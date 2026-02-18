import { getDb } from "@/db";
import { assets, bookings, users } from "@/db/schema";
import { resolveBrokerContext } from "@/features/broker/auth/resolveBrokerContext";
import {
  jsonError,
  jsonSuccess,
  mapErrorToStatus,
  safeErrorMessage,
} from "@/features/broker/property/api/server-handler/responseHelpers";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import type { APIRoute } from "astro";
import { and, desc, eq } from "drizzle-orm";

export const GET: APIRoute = async ({ request, locals, url }) => {
  const locale = getRequestLocale(request);
  try {
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError(t(locale, "error.dbNotAvailable"), 503);
    }

    const db = getDb(D1Database);
    const ctx = await resolveBrokerContext(locals, db);

    const propertyId = url.searchParams.get("propertyId");

    const conditions = [];

    if (!ctx.isAdmin) {
      if (!ctx.userId) throw new Error("Forbidden");
      conditions.push(eq(assets.userId, ctx.userId));
    }

    if (propertyId) {
      conditions.push(eq(bookings.assetId, propertyId));
    }

    const rows = await db
      .select({
        id: bookings.id,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        nights: bookings.nights,
        guests: bookings.guests,
        totalPrice: bookings.totalPrice,
        currency: bookings.currency,
        status: bookings.status,
        guestNote: bookings.guestNote,
        createdAt: bookings.createdAt,
        propertyTitle: assets.title,
        propertyId: assets.id,
        guestName: users.name,
        guestEmail: users.email,
      })
      .from(bookings)
      .innerJoin(assets, eq(bookings.assetId, assets.id))
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(bookings.createdAt));

    return jsonSuccess({ bookings: rows, total: rows.length });
  } catch (error) {
    console.error("Error listing bookings:", error);
    return jsonError(
      safeErrorMessage(error, t(locale, "error.failedToListBookings"), locale),
      mapErrorToStatus(error)
    );
  }
};
