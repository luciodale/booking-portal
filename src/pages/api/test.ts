import { brokers, getDb } from "@/db";
import { toUTCTimestamp } from "@/modules/utils/dates";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const D1Database = locals.runtime?.env?.DB;

  // Mock response when DB is not available (dev mode)
  if (!D1Database) {
    return new Response(
      JSON.stringify({
        message: "Test endpoint working (mock mode)",
        timestamp: toUTCTimestamp(new Date()),
        brokersCount: 0,
        mock: true,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const db = getDb(D1Database);
    const result = await db.select().from(brokers).limit(1);

    return new Response(
      JSON.stringify({
        message: "Test endpoint working",
        timestamp: toUTCTimestamp(new Date()),
        brokersCount: result.length,
        mock: false,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Fallback to mock if query fails
    return new Response(
      JSON.stringify({
        message: "Test endpoint working (mock mode - query failed)",
        timestamp: toUTCTimestamp(new Date()),
        brokersCount: 0,
        mock: true,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
