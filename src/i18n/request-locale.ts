import type { Locale } from "./types";
import { defaultLocale, locales } from "./types";

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getRequestLocale(request: Request): Locale {
  const acceptLang = request.headers.get("Accept-Language");
  if (!acceptLang) return defaultLocale;

  const preferred = acceptLang
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0])
    .find(isLocale);

  return preferred ?? defaultLocale;
}
