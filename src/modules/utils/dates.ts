import { format } from "date-fns";

/**
 * Converts a Date object to YYYY-MM-DD string using UTC time.
 * This is the single source of truth for date string conversion.
 * Always use this for API calls, database storage, and any date serialization.
 *
 * Example: Date(UTC 2023-01-01 00:00) -> "2023-01-01"
 */
export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Parses a YYYY-MM-DD string into a Date object set to 00:00:00 UTC.
 * This ensures consistent date handling regardless of user's timezone.
 *
 * Example: "2023-10-27" -> Date(2023-10-27T00:00:00.000Z)
 */
export function fromDateString(dateStr: string): Date {
  // Parse as UTC midnight by appending "T00:00:00.000Z"
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/**
 * Compare two date strings lexicographically
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 *
 * Example: compareDateStrings("2023-01-15", "2023-01-20") -> -1
 */
export function compareDateStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Check if two date strings represent the same date
 */
export function isSameDateString(a: string, b: string): boolean {
  return a === b;
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
  const d = typeof date === "string" ? fromDateString(date) : date;
  return format(d, "MMM d, yyyy");
}
