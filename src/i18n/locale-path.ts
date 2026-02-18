import type { Locale } from "./types";
import { defaultLocale, locales } from "./types";

export function localePath(locale: Locale | string | undefined, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!locale || locale === defaultLocale) return normalizedPath;
  return `/${locale}${normalizedPath}`;
}

export function switchLocale(currentPath: string, targetLocale: Locale): string {
  const stripped = stripLocalePrefix(currentPath);
  return localePath(targetLocale, stripped);
}

export function stripLocalePrefix(path: string): string {
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (path === `/${locale}`) return "/";
    if (path.startsWith(`/${locale}/`)) return path.slice(locale.length + 1);
  }
  return path;
}
