import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  startOfMonth,
  startOfToday,
  subMonths,
} from "date-fns";

export function getMonthDays(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
}

export function getStartPadding(date: Date): number {
  const day = getDay(startOfMonth(date));
  // Monday-based week: 0=Mon, 6=Sun
  return day === 0 ? 6 : day - 1;
}

export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function isBeforeToday(date: Date): boolean {
  return isBefore(date, startOfToday());
}

export function getDaysInRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end: addDays(end, -1) });
}

export function isSame(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}

export { addMonths, subMonths, startOfToday };
