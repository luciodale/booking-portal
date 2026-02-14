/**
 * Server-safe stay price computation from Smoobu per-night rates.
 * No Date objects — works with YYYY-MM-DD strings for Cloudflare Workers compatibility.
 */

import type { SmoobuRateDay } from "@/schemas/smoobu";

type StayPriceResult = {
  total: number;
  perNight: number;
  nights: number;
  hasPricing: boolean;
};

/**
 * Computes total stay price from a Smoobu rate map.
 * Sums per-night rates for each night of the stay (check-in day up to but not including check-out day).
 * If some nights lack rates, extrapolates from the average of priced nights.
 */
export function computeStayPrice(
  arrivalDate: string,
  departureDate: string,
  rateMap: Record<string, SmoobuRateDay>
): StayPriceResult {
  const stayDates = getDateRange(arrivalDate, departureDate);
  const nights = stayDates.length;

  if (nights === 0) {
    return { total: 0, perNight: 0, nights: 0, hasPricing: false };
  }

  let total = 0;
  let pricedNights = 0;

  for (const dateStr of stayDates) {
    const rate = rateMap[dateStr];
    if (rate?.price != null) {
      total += rate.price;
      pricedNights++;
    }
  }

  if (pricedNights === 0) {
    return { total: 0, perNight: 0, nights, hasPricing: false };
  }

  // Extrapolate missing nights from the average of priced nights
  if (pricedNights < nights) {
    const avgPerNight = total / pricedNights;
    total = Math.round(avgPerNight * nights);
  }

  return {
    total: Math.round(total),
    perNight: Math.round(total / nights),
    nights,
    hasPricing: true,
  };
}

/** Returns array of YYYY-MM-DD strings from start (inclusive) to end (exclusive). */
function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");

  while (current < endDate) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
