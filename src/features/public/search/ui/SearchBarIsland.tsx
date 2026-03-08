import { LocaleProvider } from "@/i18n/react/LocaleProvider";
import type { Locale } from "@/i18n/types";
import { SearchBar } from "./SearchBar";

type SearchBarIslandProps = {
  locale: Locale;
  cities: string[];
};

export function SearchBarIsland({ locale, cities }: SearchBarIslandProps) {
  return (
    <LocaleProvider locale={locale}>
      <SearchBar variant="hero" cities={cities} />
    </LocaleProvider>
  );
}
