/**
 * Prices API - EXPERIENCES ONLY
 * Properties use Smoobu for pricing via /api/smoobu/rates
 * Experiences use simple per-person pricing
 */

import { experiences, getDb } from "@/db";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Schema Validation
// ============================================================================

const experiencePriceRequestSchema = z.object({
  experienceIds: z.array(z.string()).min(1),
  guests: z.number().int().min(1).default(1),
});

// ============================================================================
// Response Helpers
// ============================================================================

function jsonSuccess<T>(data: T): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 400, details?: unknown): Response {
  return new Response(
    JSON.stringify({ success: false, error: { message, details } }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

// ============================================================================
// GET Handler - Calculate experience prices
// ============================================================================

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    // Reject asset/property pricing requests
    if (url.searchParams.has("assetIds")) {
      return jsonError(
        "Property pricing managed by Smoobu. Use /api/smoobu/rates",
        400
      );
    }

    const experienceIdsParam = url.searchParams.get("experienceIds");
    const guestsParam = url.searchParams.get("guests");

    const validation = experiencePriceRequestSchema.safeParse({
      experienceIds: experienceIdsParam?.split(","),
      guests: guestsParam ? Number.parseInt(guestsParam, 10) : 1,
    });

    if (!validation.success) {
      return jsonError("Invalid parameters", 400, validation.error.issues);
    }

    const { experienceIds, guests } = validation.data;
    const db = getDb(D1Database);

    const prices = await Promise.all(
      experienceIds.map(async (id) => {
        const [experience] = await db
          .select()
          .from(experiences)
          .where(eq(experiences.id, id))
          .limit(1);

        if (!experience) return null;

        return {
          id: experience.id,
          basePrice: experience.basePrice,
          totalPrice: experience.basePrice * guests,
          currency: experience.currency,
          guests,
        };
      })
    );

    return jsonSuccess({ prices: prices.filter(Boolean) });
  } catch (error) {
    console.error("Price calculation error:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to calculate prices",
      500
    );
  }
};
