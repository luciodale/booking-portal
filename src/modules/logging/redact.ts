const SENSITIVE_KEYS = new Set([
  "email",
  "phone",
  "guestEmail",
  "guestPhone",
  "guestFirstName",
  "guestLastName",
  "firstName",
  "lastName",
  "name",
  "apiKey",
  "api_key",
  "password",
  "token",
  "secret",
  "authorization",
]);

export function redactPii(
  meta: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!meta) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(key)) continue;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = redactPii(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}
