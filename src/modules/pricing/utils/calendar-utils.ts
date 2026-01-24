import type { DateRange, PricingPeriod } from "@/modules/pricing/domain/types";

export function getWeekDays(baseDate: Date) {
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Start from Monday
  start.setDate(start.getDate() + diff);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export function getMonthDays(year: number, month: number) {
  // Create dates in UTC to avoid timezone issues
  // Month is 0-indexed
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));

  // Get day of week for first day (0=Sun, adjust for Mon start)
  let startDayOfWeek = firstDay.getUTCDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const days: (Date | null)[] = [];

  // Pad with nulls for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let d = 1; d <= lastDay.getUTCDate(); d++) {
    days.push(new Date(Date.UTC(year, month, d)));
  }

  return days;
}

export function isSameDay(d1: Date | null, d2: Date | null) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isInRange(
  date: Date,
  from: Date | undefined,
  to: Date | undefined
) {
  if (!from) return false;
  if (!to) return isSameDay(date, from);
  return date >= from && date <= to;
}

export function isToday(date: Date) {
  return isSameDay(date, new Date());
}

export function isInPricingPeriod(date: Date, periods: PricingPeriod[]) {
  return periods.some((p) => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  });
}

/** Get pricing period for a specific date, if any */
export function getPricingPeriodForDate(
  date: Date,
  periods: PricingPeriod[]
): PricingPeriod | undefined {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  return periods.find((p) => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return normalizedDate >= start && normalizedDate <= end;
  });
}

/** Get effective price for a date (from period or base price) */
export function getEffectivePriceForDate(
  date: Date,
  periods: PricingPeriod[],
  basePrice: number
): number {
  const period = getPricingPeriodForDate(date, periods);
  return period?.price ?? basePrice;
}

/** Format price in cents to display format (e.g. €250) */
export function formatPriceShort(priceInCents: number): string {
  return `€${Math.round(priceInCents / 100)}`;
}

/** Build range from single date clicks */
export function buildRangeFromClick(
  date: Date,
  currentRange: DateRange | undefined
): DateRange {
  if (!currentRange?.from || (currentRange.from && currentRange.to)) {
    return { from: date, to: undefined };
  }
  if (date < currentRange.from) {
    return { from: date, to: currentRange.from };
  }
  return { from: currentRange.from, to: date };
}
