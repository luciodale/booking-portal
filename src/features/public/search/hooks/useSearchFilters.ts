import type {
  PropertyPrice,
  SearchProperty,
  TierFilter,
} from "@/features/public/search/types";
import { useMemo, useState } from "react";

type UseSearchFiltersArgs = {
  properties: SearchProperty[];
  prices: Map<string, PropertyPrice>;
  checkIn: string | null;
  checkOut: string | null;
  guests: string | null;
};

export function useSearchFilters({
  properties,
  prices,
  checkIn,
  checkOut,
  guests,
}: UseSearchFiltersArgs) {
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const guestsNum = guests ? Number(guests) : null;
  const hasDates = checkIn != null && checkOut != null;

  const filtered = useMemo(() => {
    let result = [...properties];

    if (tierFilter !== "all") {
      result = result.filter((p) => p.asset.tier === tierFilter);
    }

    if (guestsNum != null && guestsNum > 0) {
      result = result.filter(
        (p) => p.asset.maxOccupancy == null || p.asset.maxOccupancy >= guestsNum
      );
    }

    if (onlyAvailable && hasDates) {
      result = result.filter((p) => {
        const price = prices.get(p.asset.id);
        if (!price || price.loading) return true;
        return price.available;
      });
    }

    return result;
  }, [properties, tierFilter, guestsNum, onlyAvailable, hasDates, prices]);

  return {
    filtered,
    tierFilter,
    setTierFilter,
    onlyAvailable,
    setOnlyAvailable,
    hasDates,
  };
}
