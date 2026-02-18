import { createContext, useContext, useCallback, type PropsWithChildren } from "react";
import type { Locale } from "../types";
import { defaultLocale } from "../types";
import type { TranslationKey } from "../translations/dictionary";
import { t as tFn } from "../t";
import { localePath as localePathFn } from "../locale-path";

type LocaleContextValue = {
  locale: Locale;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  localePath: (path: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = PropsWithChildren<{ locale: Locale }>;

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      tFn(locale, key, params),
    [locale],
  );

  const localePath = useCallback(
    (path: string) => localePathFn(locale, path),
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, t, localePath }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: defaultLocale,
      t: (key: TranslationKey, params?: Record<string, string | number>) =>
        tFn(defaultLocale, key, params),
      localePath: (path: string) => localePathFn(defaultLocale, path),
    };
  }
  return ctx;
}
