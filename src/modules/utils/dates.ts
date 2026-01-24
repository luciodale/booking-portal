import { format, parseISO, startOfDay } from "date-fns";

/**
 * Converts a Date object to a YYYY-MM-DD string using the local time of the Date object.
 * This should be used when sending dates to the API or storing in the database as "local dates".
 *
 * Example: Date('2023-10-27T10:00:00') -> "2023-10-27"
 */
export function toISODateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Converts a Date object to YYYY-MM-DD string using UTC time.
 * This guarantees consistency regardless of local timezone.
 * Use this for "Universal" dates (e.g. pricing periods selection).
 *
 * Example: Date(UTC 2023-01-01 00:00) -> "2023-01-01"
 */
export function toUniversalISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Parses a YYYY-MM-DD string into a standard Date object set to 00:00:00 local time.
 * This is "Day Start" - safe for calculations where time doesn't matter (pricing per night).
 *
 * Example: "2023-10-27" -> Fri Oct 27 2023 00:00:00 GMT+xx00
 */
export function fromISODateString(dateStr: string): Date {
  // parseISO parses as local time if no timezone is specified?
  // Actually parseISO parses "2023-10-27" as local midnight.
  // startOfDay ensures it is 00:00:00.000
  return startOfDay(parseISO(dateStr));
}

/**
 * Converts a Date object to a UTC ISO string (e.g. 2023-10-27T14:30:00.000Z).
 * Use this for Timestamps (created_at, updated_at).
 */
export function toUTCTimestamp(date: Date): string {
  return date.toISOString();
}

/**
 * Formats a date for display to the user (e.g. "Oct 27, 2023").
 * Input can be a Date object or a YYYY-MM-DD string.
 */
export function formatDateDisplay(
  date: Date | string,
  locale = "en-US"
): string {
  const d = typeof date === "string" ? fromISODateString(date) : date;
  return format(d, "MMM d, yyyy");
}
