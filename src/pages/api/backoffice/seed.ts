/**
 * Seed API - Dev only
 * POST /api/backoffice/seed - Create mock broker for development
 */

import { brokers, getDb } from "@/db";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  try {
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return new Response(JSON.stringify({ success: false, error: "DB not available" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = getDb(D1Database);

    // Create mock broker
    await db
      .insert(brokers)
      .values({
        id: "broker-001",
        clerkUserId: "clerk-dev-user",
        name: "Demo Broker",
        email: "demo@example.com",
        verified: true,
      })
      .onConflictDoNothing();

    return new Response(JSON.stringify({ success: true, message: "Seeded broker-001" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

