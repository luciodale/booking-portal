import type { BookingContextInput } from "@/modules/booking/domain/schema";
import { fromISODateString } from "@/modules/shared/utils/dates";
/**
 * Pricing Engine - Pure calculation functions for booking prices
 * Shared between client (UX) and server (validation)
 */
import { addDays, differenceInCalendarDays, isWithinInterval } from "date-fns";

// ============================================================================
// Types
// ============================================================================

export type PricingModel = "per_night" | "per_person" | "fixed";

export type AssetType = "apartment" | "boat" | "tour" | "experience";

export type BookingContext = BookingContextInput;

export type NightlyPriceResult = {
  price: number; // cents
  appliedRule: string | null;
};

export type PriceBreakdown = {
  baseTotal: number; // cents
  cleaningFee: number; // cents
  serviceFee: number; // cents (12% of base + cleaning)
  total: number; // cents
  nights: number;
  appliedRules: string[];
  currency: string;
};

// ============================================================================
// Service fee percentage
// ============================================================================
const SERVICE_FEE_PERCENT = 0.12;

// ============================================================================
// Pure Calculation Functions
// ============================================================================

/**
 * Get the price for a specific night, applying any matching pricing rules.
 * Returns the highest-priority active rule that covers the date.
 */
export function getNightlyPriceForDate(
  date: Date,
  context: BookingContext
): NightlyPriceResult {
  // Find active rules that cover this date, sorted by priority (highest first)
  const activeRule = context.pricingRules
    .filter((rule) => {
      if (!rule.active) return false;
      try {
        const start = fromISODateString(rule.startDate);
        const end = fromISODateString(rule.endDate);
        return isWithinInterval(date, { start, end });
      } catch {
        return false;
      }
    })
    .sort((a, b) => b.priority - a.priority)[0];

  if (activeRule) {
    // Multiplier is stored as integer (100 = 1x, 150 = 1.5x)
    const adjustedPrice = Math.round(
      (context.basePrice * activeRule.multiplier) / 100
    );
    return { price: adjustedPrice, appliedRule: activeRule.name };
  }

  return { price: context.basePrice, appliedRule: null };
}

/**
 * Calculate complete price breakdown for a booking.
 * Handles both per-night (apartments, boats) and per-person (tours, experiences) models.
 */
export function calculatePriceBreakdown(
  startDate: Date | null,
  endDate: Date | null,
  guests: number,
  context: BookingContext
): PriceBreakdown | null {
  if (!startDate || !context) return null;

  let baseTotal = 0;
  const appliedRulesSet = new Set<string>();
  let nights = 0;

  // ===== STRATEGY A: Per Night (Apartments, Boats) =====
  if (context.pricingModel === "per_night") {
    if (!endDate) return null;

    nights = differenceInCalendarDays(endDate, startDate);
    if (nights <= 0) return null;

    // Iterate through each night to check for pricing rules
    for (let i = 0; i < nights; i++) {
      const currentNight = addDays(startDate, i);
      const { price, appliedRule } = getNightlyPriceForDate(
        currentNight,
        context
      );
      baseTotal += price;
      if (appliedRule) {
        appliedRulesSet.add(appliedRule);
      }
    }
  }
  // ===== STRATEGY B: Per Person (Tours, Experiences) =====
  else if (context.pricingModel === "per_person") {
    nights = 1; // Tours are single-day
    baseTotal = context.basePrice * guests;
  }
  // ===== STRATEGY C: Fixed Price =====
  else if (context.pricingModel === "fixed") {
    nights = 1;
    baseTotal = context.basePrice;
  }

  // Calculate fees
  const cleaningFee =
    context.pricingModel === "per_night" ? context.cleaningFee : 0;
  const serviceFee = Math.round(
    (baseTotal + cleaningFee) * SERVICE_FEE_PERCENT
  );
  const total = baseTotal + cleaningFee + serviceFee;

  return {
    baseTotal,
    cleaningFee,
    serviceFee,
    total,
    nights,
    appliedRules: Array.from(appliedRulesSet),
    currency: context.currency,
  };
}

/**
 * Apply channel markup to a price breakdown.
 * Used when calculating prices for OTA channels (Airbnb, Booking.com).
 */
export function applyChannelMarkup(
  breakdown: PriceBreakdown,
  markupPercent: number
): PriceBreakdown {
  const multiplier = 1 + markupPercent / 100;
  return {
    ...breakdown,
    baseTotal: Math.round(breakdown.baseTotal * multiplier),
    serviceFee: Math.round(breakdown.serviceFee * multiplier),
    total: Math.round(breakdown.total * multiplier),
  };
}
