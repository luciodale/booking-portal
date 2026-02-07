import { fromCents, toCents } from "@/modules/utils/money";
import type { BookingContextInput } from "@/schemas";
import { addDays, differenceInCalendarDays } from "date-fns";
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
 * Get the price for a specific night.
 * Note: Pricing rules are now managed through Smoobu.
 * This function returns the base price directly.
 */
export function getNightlyPriceForDate(
  date: Date,
  context: BookingContext
): NightlyPriceResult {
  // Pricing is now managed through Smoobu, so we return the base price
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

    // Iterate through each night
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
