import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  startOfToday,
  subMonths,
} from "date-fns";
import { eachDayOfInterval } from "date-fns";

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

export function todayStr(): string {
  return formatDate(startOfToday());
}

export function toDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export { addMonths, subMonths, startOfToday, startOfMonth };
