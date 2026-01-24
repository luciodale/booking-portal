/**
 * Error utilities for formatting and displaying errors
 */

import type { ApiError } from "@/modules/api-client/client";
import type { ZodIssue } from "zod";

/**
 * Check if error is ApiError with Zod validation details
 */
export function isApiErrorWithDetails(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    "details" in error &&
    Array.isArray((error as ApiError).details)
  );
}

/**
 * Format Zod validation issues into user-friendly messages
 */
export function formatZodErrors(issues: ZodIssue[]): string[] {
  return issues.map((issue) => {
    const path = issue.path.join(".");
    const fieldName = path || "field";

    // Make field names more readable
    const readableField = fieldName
      .replace(/([A-Z])/g, " $1")
      .toLowerCase()
      .trim();

    return `${readableField}: ${issue.message}`;
  });
}

/**
 * Get formatted error message(s) from any error type
 */
export function getErrorMessages(error: unknown): string[] {
  if (isApiErrorWithDetails(error)) {
    return formatZodErrors(error.details as ZodIssue[]);
  }

  if (error instanceof Error) {
    return [error.message];
  }

  return ["An unknown error occurred"];
}

/**
 * Get single error message (first error or generic message)
 */
export function getErrorMessage(error: unknown): string {
  const messages = getErrorMessages(error);
  return messages[0] || "An error occurred";
}
