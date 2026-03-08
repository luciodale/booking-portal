import { LocaleProvider } from "@/i18n/react/LocaleProvider";
import type { Locale } from "@/i18n/types";
import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";

type SearchBarIslandProps = {
  locale: Locale;
  cities?: string[];
};

export function SearchBarIsland({ locale, cities: staticCities }: SearchBarIslandProps) {
  const [cities, setCities] = useState<string[]>(staticCities ?? []);

  useEffect(() => {
    if (staticCities) return;
    fetch("/api/cities")
      .then((res) => res.json() as Promise<string[]>)
      .then((data) => setCities(data))
      .catch(() => {});
  }, [staticCities]);

  return (
    <LocaleProvider locale={locale}>
      <SearchBar variant="hero" cities={cities} />
    </LocaleProvider>
  );
}
