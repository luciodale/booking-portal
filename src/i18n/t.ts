import type { Locale } from "./types";
import { defaultLocale } from "./types";
import { type TranslationKey, dictionaries } from "./translations/dictionary";

function isLocale(value: string): value is Locale {
  return value === "en" || value === "it";
}

export function t(
  locale: Locale | string | undefined,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const resolvedLocale: Locale =
    locale && isLocale(locale) ? locale : defaultLocale;

  const dict = dictionaries[resolvedLocale];
  let value = dict[key] ?? dictionaries[defaultLocale][key] ?? key;

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
    }
  }

  return value;
}
