import { fetchPropertyRates } from "@/features/public/booking/api/fetchPropertyRates";
import type { PropertyPrice, SearchProperty } from "@/features/public/search/types";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

function computeAvgNightlyRate(
  ratesData: Record<string, Record<string, { price: number | null; available: number }>>,
): { avg: number; count: number } {
  let total = 0;
  let count = 0;
  for (const dates of Object.values(ratesData)) {
    for (const day of Object.values(dates)) {
      if (day.price != null) {
        total += day.price;
        count++;
      }
    }
  }
  return { avg: count > 0 ? total / count : 0, count };
}

export function useSearchPrices(
  properties: SearchProperty[],
  checkIn: string | null,
  checkOut: string | null,
): Map<string, PropertyPrice> {
  const enabled = checkIn != null && checkOut != null;

  const queries = useQueries({
    queries: properties.map((p) => ({
      queryKey: ["search-rates", p.asset.id, checkIn, checkOut] as const,
      queryFn: () => fetchPropertyRates(p.asset.id, checkIn ?? "", checkOut ?? ""),
      enabled,
      staleTime: 5 * 60 * 1000,
    })),
  });

  return useMemo(() => {
    const map = new Map<string, PropertyPrice>();
    for (let i = 0; i < properties.length; i++) {
      const query = queries[i];
      if (!query || !enabled) continue;

      const propertyId = properties[i].asset.id;
      if (query.isLoading) {
        map.set(propertyId, { avgNightlyRate: 0, currency: "EUR", loading: true, error: false });
      } else if (query.isError) {
        map.set(propertyId, { avgNightlyRate: 0, currency: "EUR", loading: false, error: true });
      } else if (query.data) {
        const { avg } = computeAvgNightlyRate(query.data.rates.data);
        map.set(propertyId, {
          avgNightlyRate: Math.round(avg),
          currency: query.data.currency,
          loading: false,
          error: false,
        });
      }
    }
    return map;
  }, [properties, queries, enabled]);
}
