import { locales } from "../types";
import { switchLocale } from "../locale-path";
import { useLocale } from "./LocaleProvider";

export function LanguageSwitcher() {
  const { locale } = useLocale();
  const currentPath = window.location.pathname;
  const search = window.location.search;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {locales.map((targetLocale) => {
        const href = switchLocale(currentPath, targetLocale) + search;
        const isActive = targetLocale === locale;
        return (
          <a
            key={targetLocale}
            href={href}
            className={
              isActive
                ? "text-foreground font-medium"
                : "hover:text-foreground transition-colors"
            }
            aria-current={isActive ? "true" : undefined}
          >
            {targetLocale.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}
