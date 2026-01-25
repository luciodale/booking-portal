import { assets, experiences, getDb, pricingRules } from "@/db";
import type { BookingContext } from "@/modules/booking/domain/pricing";
import { calculatePriceBreakdown } from "@/modules/booking/domain/pricing";
import { fromDateString } from "@/modules/utils/dates";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// Schema Validation
// ============================================================================

const priceRequestSchema = z.object({
  startDate: z.string(),
  endDate: z.string().optional(),
  assetIds: z.array(z.string()).optional(),
  experienceIds: z.array(z.string()).optional(),
  guests: z.number().int().min(1).default(1),
});

type PriceRequest = z.infer<typeof priceRequestSchema>;

// ============================================================================
// Response Types
// ============================================================================

type PriceResult = {
  id: string;
  basePrice: number; // cents
  computedPrice: number; // cents (with rules applied)
  currency: string;
  nights: number;
  appliedRules: string[];
};

type PriceResponse = {
  success: boolean;
  data?: {
    prices: PriceResult[];
  };
  error?: {
    message: string;
    details?: unknown;
  };
};

// ============================================================================
// Helper Functions
// ============================================================================

function jsonSuccess(prices: PriceResult[]): Response {
  const response: PriceResponse = {
    success: true,
    data: { prices },
  };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 400, details?: unknown): Response {
  const response: PriceResponse = {
    success: false,
    error: { message, details },
  };
  return new Response(JSON.stringify(response), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ============================================================================
// GET Handler - Calculate prices for multiple assets/experiences
// ============================================================================

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const D1Database = locals.runtime?.env?.DB;
    if (!D1Database) {
      return jsonError("Database not available", 503);
    }

    const db = getDb(D1Database);

    // Parse and validate query params
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const assetIdsParam = url.searchParams.get("assetIds");
    const experienceIdsParam = url.searchParams.get("experienceIds");
    const guestsParam = url.searchParams.get("guests");

    const validation = priceRequestSchema.safeParse({
      startDate,
      endDate,
      assetIds: assetIdsParam ? assetIdsParam.split(",") : undefined,
      experienceIds: experienceIdsParam
        ? experienceIdsParam.split(",")
        : undefined,
      guests: guestsParam ? Number.parseInt(guestsParam, 10) : 1,
    });

    if (!validation.success) {
      return jsonError(
        "Invalid request parameters",
        400,
        validation.error.issues
      );
    }

    const {
      startDate: startDateStr,
      endDate: endDateStr,
      assetIds,
      experienceIds,
      guests,
    } = validation.data;

    const startDateParsed = fromDateString(startDateStr);
    const endDateParsed = endDateStr ? fromDateString(endDateStr) : null;

    const prices: PriceResult[] = [];

    // ===== Calculate Asset Prices =====
    if (assetIds && assetIds.length > 0) {
      for (const assetId of assetIds) {
        // Fetch asset
        const [asset] = await db
          .select()
          .from(assets)
          .where(eq(assets.id, assetId))
          .limit(1);

        if (!asset) {
          continue; // Skip missing assets
        }

        // Fetch pricing rules for this asset
        const rules = await db
          .select()
          .from(pricingRules)
          .where(eq(pricingRules.assetId, assetId));

        // Build booking context
        const context: BookingContext = {
          assetId: asset.id,
          pricingModel: "per_night",
          basePrice: asset.basePrice,
          cleaningFee: asset.cleaningFee ?? 0,
          currency: asset.currency,
          maxGuests: asset.maxGuests ?? 2,
          minNights: asset.minNights ?? 1,
          pricingRules: rules,
        };

        // Calculate price
        const breakdown = calculatePriceBreakdown(
          startDateParsed,
          endDateParsed,
          guests,
          context
        );

        if (breakdown) {
          prices.push({
            id: asset.id,
            basePrice: asset.basePrice,
            computedPrice: breakdown.baseTotal, // Just accommodation cost (no fees for list view)
            currency: asset.currency,
            nights: breakdown.nights,
            appliedRules: breakdown.appliedRules,
          });
        }
      }
    }

    // ===== Calculate Experience Prices =====
    if (experienceIds && experienceIds.length > 0) {
      for (const experienceId of experienceIds) {
        // Fetch experience
        const [experience] = await db
          .select()
          .from(experiences)
          .where(eq(experiences.id, experienceId))
          .limit(1);

        if (!experience) {
          continue; // Skip missing experiences
        }

        // Experiences use per_person pricing model (no date-based rules for now)
        const context: BookingContext = {
          assetId: experience.id,
          pricingModel: "per_person",
          basePrice: experience.basePrice,
          cleaningFee: 0,
          currency: experience.currency,
          maxGuests: experience.maxParticipants ?? 10,
          minNights: 1,
          pricingRules: [], // TODO: Add experience pricing rules if needed
        };

        const breakdown = calculatePriceBreakdown(
          startDateParsed,
          null, // Experiences are single-day
          guests,
          context
        );

        if (breakdown) {
          prices.push({
            id: experience.id,
            basePrice: experience.basePrice,
            computedPrice: breakdown.baseTotal,
            currency: experience.currency,
            nights: 1,
            appliedRules: breakdown.appliedRules,
          });
        }
      }
    }

    return jsonSuccess(prices);
  } catch (error) {
    console.error("Price calculation error:", error);
    return jsonError(
      error instanceof Error ? error.message : "Failed to calculate prices",
      500
    );
  }
};
