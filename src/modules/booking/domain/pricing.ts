import type { BookingContextInput } from "@/modules/booking/domain/schema";
import { fromDateString } from "@/modules/utils/dates";
import { applyMultiplier, fromCents, toCents } from "@/modules/utils/money";
import { addDays, differenceInCalendarDays, isWithinInterval } from "date-fns";
import Decimal from "decimal.js-light";

// ============================================================================
// Types
// ============================================================================

export type PricingModel = "per_night" | "per_person" | "fixed";

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
        const start = fromDateString(rule.startDate);
        const end = fromDateString(rule.endDate);
        return isWithinInterval(date, { start, end });
      } catch {
        return false;
      }
    })
    .sort((a, b) => b.priority - a.priority)[0];

  if (activeRule) {
    // Multiplier is stored as integer (100 = 1x, 150 = 1.5x)
    // Use decimal.js to avoid rounding errors
    const adjustedPrice = toCents(
      applyMultiplier(context.basePrice, activeRule.multiplier)
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

  // Calculate fees using decimal.js for precision
  const cleaningFee =
    context.pricingModel === "per_night" ? context.cleaningFee : 0;

  // Use Decimal for service fee calculation
  const subtotal = fromCents(baseTotal).plus(fromCents(cleaningFee));
  const serviceFee = toCents(subtotal.times(new Decimal(1)));

  // Total is sum of rounded components (ensures breakdown sums to total exactly)
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
  // Use decimal.js for precise markup calculation
  const multiplier = new Decimal(1).plus(new Decimal(markupPercent).div(100));

  const baseTotalWithMarkup = toCents(
    fromCents(breakdown.baseTotal).times(multiplier)
  );
  const serviceFeeWithMarkup = toCents(
    fromCents(breakdown.serviceFee).times(multiplier)
  );

  // Total is sum of rounded components
  const total =
    baseTotalWithMarkup + breakdown.cleaningFee + serviceFeeWithMarkup;

  return {
    ...breakdown,
    baseTotal: baseTotalWithMarkup,
    serviceFee: serviceFeeWithMarkup,
    total,
  };
}
