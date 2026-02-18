import { getDb } from "@/db";
import { assets, bookings } from "@/db/schema";
import { getRequestLocale } from "@/i18n/request-locale";
import { t } from "@/i18n/t";
import { requireAuth } from "@/modules/auth/auth";
import type { APIRoute } from "astro";
import { desc, eq } from "drizzle-orm";

export const GET: APIRoute = async ({ request, locals }) => {
  const locale = getRequestLocale(request);
  try {
    const authContext = requireAuth(locals);

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return new Response(JSON.stringify({ error: t(locale, "error.dbNotAvailable") }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb(D1Database);

    const userBookings = await db
      .select({
        id: bookings.id,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        nights: bookings.nights,
        guests: bookings.guests,
        totalPrice: bookings.totalPrice,
        currency: bookings.currency,
        status: bookings.status,
        createdAt: bookings.createdAt,
        propertyTitle: assets.title,
        propertyId: assets.id,
      })
      .from(bookings)
      .innerJoin(assets, eq(bookings.assetId, assets.id))
      .where(eq(bookings.userId, authContext.userId))
      .orderBy(desc(bookings.checkIn));

    return new Response(JSON.stringify({ data: userBookings }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return new Response(JSON.stringify({ error: t(locale, "error.signInRequired") }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: t(locale, "error.failedToFetchBookings") }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
