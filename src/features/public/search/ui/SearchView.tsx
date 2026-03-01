import { useMapInteraction } from "@/features/public/search/hooks/useMapInteraction";
import { useSearchPrices } from "@/features/public/search/hooks/useSearchPrices";
import type {
  SearchProperty,
  TierFilter,
} from "@/features/public/search/types";
import { LocaleProvider, useLocale } from "@/i18n/react/LocaleProvider";
import type { Locale } from "@/i18n/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SearchBar } from "./SearchBar";
import { SearchFilters } from "./SearchFilters";
import { SearchMap } from "./SearchMap";
import { SearchPropertyCard } from "./SearchPropertyCard";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

type SearchViewProps = {
  properties: SearchProperty[];
  cities: string[];
  city: string | null;
  checkIn: string | null;
  checkOut: string | null;
  guests: string | null;
  locale: Locale;
};

export function SearchView(props: SearchViewProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider locale={props.locale}>
        <SearchViewInner {...props} />
      </LocaleProvider>
    </QueryClientProvider>
  );
}

function SearchViewInner({
  properties,
  cities,
  city,
  checkIn,
  checkOut,
  guests,
}: SearchViewProps) {
  const { t } = useLocale();
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const { selectedId, focusId, selectProperty, focusProperty, setPropertyRef } =
    useMapInteraction();

  const guestsNum = guests ? Number(guests) : null;

  const filteredProperties = useMemo(() => {
    let result = [...properties];
    if (tierFilter !== "all") {
      result = result.filter((p) => p.asset.tier === tierFilter);
    }
    if (guestsNum != null && guestsNum > 0) {
      result = result.filter(
        (p) => p.asset.maxOccupancy == null || p.asset.maxOccupancy >= guestsNum
      );
    }
    return result;
  }, [properties, tierFilter, guestsNum]);

  const prices = useSearchPrices(filteredProperties, checkIn, checkOut);

  return (
    <div className="flex flex-col h-content-fit">
      {/* Search bar — above the split, centered, z-20 so dropdown floats above split */}
      <div className="bg-background z-20 relative px-4 py-4 border-b border-border flex justify-center">
        <div className="w-full max-w-3xl">
          <SearchBar
            variant="hero"
            cities={cities}
            defaultCity={city}
            defaultCheckIn={checkIn ?? ""}
            defaultCheckOut={checkOut ?? ""}
            defaultGuests={guests ?? ""}
          />
        </div>
      </div>

      {/* Split: list + map — fixed vh so map is always fully visible */}
      <div
        className="flex flex-col lg:flex-row"
        style={{ height: "calc(100vh - 70px - 82px)" }}
      >
        {/* Map — top on mobile, right on desktop, always full height */}
        <div className="h-[40vh] lg:h-full lg:w-5/12 lg:flex-none lg:order-2">
          <SearchMap
            properties={filteredProperties}
            prices={prices}
            selectedId={selectedId}
            focusId={focusId}
            onPropertySelect={selectProperty}
          />
        </div>

        {/* List — below on mobile, left on desktop, scrollable */}
        <div className="flex-1 lg:order-1 overflow-y-auto">
          <div className="sticky top-0 bg-background z-10 px-4 py-3 border-b border-border">
            <SearchFilters
              city={city}
              resultCount={filteredProperties.length}
              tierFilter={tierFilter}
              onTierChange={setTierFilter}
            />
          </div>

          {filteredProperties.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground text-sm">
                {t("search.noResults")}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredProperties.map((property) => (
                <div
                  key={property.asset.id}
                  ref={(el) => setPropertyRef(property.asset.id, el)}
                >
                  <SearchPropertyCard
                    property={property}
                    price={prices.get(property.asset.id)}
                    isSelected={selectedId === property.asset.id}
                    onViewOnMap={focusProperty}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
