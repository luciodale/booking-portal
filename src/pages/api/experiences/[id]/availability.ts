import { getDb } from "@/db";
import { experienceBookings } from "@/db/schema";
import { safeErrorMessage } from "@/features/broker/property/api/server-handler/responseHelpers";
import type { APIRoute } from "astro";
import { and, eq, like, sql } from "drizzle-orm";

type AvailabilityData = Record<string, { bookedParticipants: number }>;

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ params, url, locals }) => {
  try {
    const experienceId = params.id;
    if (!experienceId) {
      return jsonResponse({ error: "Missing experience ID" }, 400);
    }

    const month = url.searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return jsonResponse({ error: "Invalid month format. Use YYYY-MM" }, 400);
    }

    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonResponse({ error: "Database not available" }, 503);
    }

    const db = getDb(D1Database);

    const rows = await db
      .select({
        bookingDate: experienceBookings.bookingDate,
        totalParticipants: sql<number>`sum(${experienceBookings.participants})`,
      })
      .from(experienceBookings)
      .where(
        and(
          eq(experienceBookings.experienceId, experienceId),
          like(experienceBookings.bookingDate, `${month}%`),
          sql`${experienceBookings.status} IN ('confirmed', 'pending')`
        )
      )
      .groupBy(experienceBookings.bookingDate);

    const data: AvailabilityData = {};
    for (const row of rows) {
      data[row.bookingDate] = { bookedParticipants: row.totalParticipants };
    }

    return jsonResponse({ data });
  } catch (error) {
    console.error("Error fetching experience availability:", error);
    return jsonResponse(
      { error: safeErrorMessage(error, "Failed to fetch availability") },
      500
    );
  }
};
