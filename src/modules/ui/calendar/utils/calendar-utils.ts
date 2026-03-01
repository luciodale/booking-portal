/**
 * Calendar Utilities
 * Helper functions for calendar views
 */

import { centsToUnit } from "@/modules/money/money";
import type { PricingPeriod } from "../domain/types";

/**
 * Generate array of days for a month grid (including padding for alignment)
 */
export function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Get day of week (0=Sun, 1=Mon, ..., 6=Sat), adjust for Monday start
  let startDayOfWeek = firstDay.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const days: (Date | null)[] = [];

  // Padding for first week
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

/**
 * Get days for a specific week
 */
export function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  const dayOfWeek = start.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  start.setDate(start.getDate() + diff);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

/**
 * Format price for display (short form)
 */
export function formatPriceShort(cents: number): string {
  return `€${Math.round(centsToUnit(cents))}`;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Check if a date is within a range (inclusive)
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = date.getTime();
  return d >= start.getTime() && d <= end.getTime();
}

/**
 * Get effective price for a date based on periods
 */
export function getEffectivePriceForDate(
  date: Date,
  periods: PricingPeriod[],
  basePrice: number
): number {
  const period = periods.find((p) =>
    isDateInRange(date, p.startDate, p.endDate)
  );
  return period?.price ?? basePrice;
}

/**
 * Check if a date is within any pricing period
 */
export function isInPricingPeriod(
  date: Date,
  periods: PricingPeriod[]
): boolean {
  return periods.some((p) => isDateInRange(date, p.startDate, p.endDate));
}
