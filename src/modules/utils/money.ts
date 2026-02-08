/**
 * Monetary calculation utilities using decimal.js-light
 * Ensures precise financial calculations without floating-point errors
 */

import Decimal from "decimal.js-light";

// Configure for financial calculations
// Precision: 20 significant digits
// Rounding: ROUND_HALF_UP (standard rounding, 0.5 rounds up)
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Create Decimal from cents (integer)
 * @example fromCents(2500) -> Decimal(2500)
 */
export function fromCents(cents: number): Decimal {
  return new Decimal(cents);
}

/**
 * Convert Decimal to cents (integer) with explicit rounding
 * @example toCents(new Decimal(2500.6)) -> 2501
 */
export function toCents(d: Decimal): number {
  return d.toDecimalPlaces(0).toNumber();
}

/**
 * Format cents as EUR display string with 2 decimal places
 * @example formatEuros(2500) -> "25.00"
 */
export function formatEuros(cents: number): string {
  return new Decimal(cents).div(100).toFixed(2);
}

/**
 * Apply percentage markup to base amount: base * (1 + pct/100)
 * @example applyPercentage(10000, 20) -> Decimal(12000) // +20%
 * @example applyPercentage(10000, -10) -> Decimal(9000) // -10%
 */
export function applyPercentage(baseCents: number, pct: number): Decimal {
  return fromCents(baseCents).times(
    new Decimal(1).plus(new Decimal(pct).div(100))
  );
}

/**
 * Calculate percentage of amount: base * (pct/100)
 * @example percentageOf(10000, 12) -> Decimal(1200) // 12% of €100
 */
export function percentageOf(baseCents: number, pct: number): Decimal {
  return fromCents(baseCents).times(new Decimal(pct).div(100));
}

/**
 * Multiply base by multiplier (stored as integer, 100 = 1.0x, 150 = 1.5x)
 * Used for pricing rules: basePrice * multiplier / 100
 * @example applyMultiplier(10000, 150) -> Decimal(15000) // 1.5x markup
 */
export function applyMultiplier(
  baseCents: number,
  multiplier: number
): Decimal {
  return fromCents(baseCents).times(new Decimal(multiplier).div(100));
}

/**
 * Compute multiplier from target price and base price
 * Used when user sets absolute price: (targetCents / baseCents) * 100
 * @example computeMultiplier(15000, 10000) -> 150 (1.5x)
 */
export function computeMultiplier(
  targetCents: number,
  baseCents: number
): number {
  if (baseCents === 0) return 100;
  return fromCents(targetCents)
    .div(fromCents(baseCents))
    .times(100)
    .toDecimalPlaces(0)
    .toNumber();
}