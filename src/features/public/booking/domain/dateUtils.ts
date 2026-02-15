import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  startOfToday,
  subMonths,
} from "date-fns";
import { eachDayOfInterval } from "date-fns";
import type { SmoobuRateDay } from "@/schemas/smoobu";

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
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

export function todayStr(): string {
  return formatDate(startOfToday());
}

export function toDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

/**
 * Compute the API date range for two visible calendar months.
 * Smoobu's end_date is exclusive, so we add 1 day to include the last day.
 */
export function computeRateRange(currentMonth: Date): {
  rangeStart: string;
  rangeEnd: string;
} {
  const rangeStart = formatDate(startOfMonth(currentMonth));
  const rangeEnd = formatDate(
    addDays(endOfMonth(addMonths(currentMonth, 1)), 1)
  );
  return { rangeStart, rangeEnd };
}

type DayDisplayState = {
  past: boolean;
  unavailable: boolean;
  isCheckIn: boolean;
  isCheckOut: boolean;
  inRange: boolean;
  showPrice: boolean;
  price: number | null;
};

export function getDayDisplayState(params: {
  dateStr: string;
  today: string;
  checkIn: string | null;
  checkOut: string | null;
  rate: SmoobuRateDay | undefined;
  ratesLoading: boolean;
  currency: string | null;
}): DayDisplayState {
  const { dateStr, today, checkIn, checkOut, rate, ratesLoading, currency } =
    params;
  const past = dateStr < today;
  const unavailable = past || (rate !== undefined && rate.available === 0);
  const isCheckIn = dateStr === checkIn;
  const isCheckOut = dateStr === checkOut;
  const inRange = !!(
    checkIn &&
    checkOut &&
    dateStr > checkIn &&
    dateStr < checkOut
  );
  const price = rate?.price ?? null;
  const showPrice =
    !ratesLoading && price != null && !past && currency != null;

  return { past, unavailable, isCheckIn, isCheckOut, inRange, showPrice, price };
}

export { addMonths, subMonths, startOfToday, startOfMonth };
