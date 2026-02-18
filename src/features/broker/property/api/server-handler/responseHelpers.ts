import { t } from "@/i18n/t";
import type { TranslationKey } from "@/i18n/translations/dictionary";

export function jsonSuccess<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function jsonError(
  message: string,
  status = 500,
  details?: unknown
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message, details },
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function mapErrorToStatus(error: unknown): number {
  if (!(error instanceof Error)) return 500;
  const msg = error.message;
  if (msg === "Unauthorized") return 401;
  if (msg.startsWith("Forbidden")) return 403;
  return 500;
}

export function safeErrorMessage(error: unknown, fallback: string, locale?: string): string {
  if (!(error instanceof Error)) return fallback;
  const msg = error.message;
  if (msg === "Unauthorized") return locale ? t(locale, "error.unauthorized" as TranslationKey) : msg;
  if (msg.startsWith("Forbidden")) return locale ? t(locale, "error.forbidden" as TranslationKey) : msg;
  if (msg.includes("UNIQUE constraint failed"))
    return locale ? t(locale, "error.recordAlreadyExists" as TranslationKey) : "This record already exists";
  if (msg.includes("NOT NULL constraint failed"))
    return locale ? t(locale, "error.requiredFieldMissing" as TranslationKey) : "A required field is missing";
  if (msg.includes("Failed query:") || msg.includes("SQLITE_")) return fallback;
  return fallback;
}
