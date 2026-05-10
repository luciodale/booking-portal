import type { getDb } from "@/db";
import { platformSettings } from "@/db/schema";
import { countryNameToCode } from "@/modules/countries";
import { eq } from "drizzle-orm";

const PLATFORM_SETTINGS_KEY = "supportedCountries";
const DEFAULT_SUPPORTED = ["IT"];

/**
 * Read the supported countries allowlist from platform settings. Stored as a
 * JSON encoded array of ISO 3166-1 alpha-2 codes (uppercase). Falls back to
 * Italy only, which matches the current production posture.
 */
export async function getSupportedCountries(
  db: ReturnType<typeof getDb>
): Promise<string[]> {
  const [row] = await db
    .select({ value: platformSettings.value })
    .from(platformSettings)
    .where(eq(platformSettings.key, PLATFORM_SETTINGS_KEY))
    .limit(1);

  if (!row?.value) return DEFAULT_SUPPORTED;

  try {
    const parsed = JSON.parse(row.value);
    if (
      Array.isArray(parsed) &&
      parsed.every((c) => typeof c === "string" && /^[A-Z]{2}$/.test(c))
    ) {
      return parsed.length > 0 ? parsed : DEFAULT_SUPPORTED;
    }
  } catch {}

  return DEFAULT_SUPPORTED;
}

export async function isCountrySupported(
  db: ReturnType<typeof getDb>,
  country: string | null | undefined
): Promise<boolean> {
  const code = countryNameToCode(country);
  if (!code) return false;
  const supported = await getSupportedCountries(db);
  return supported.includes(code);
}
