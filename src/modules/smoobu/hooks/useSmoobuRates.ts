/**
 * useSmoobuRates - Hook to fetch pricing rates from Smoobu
 * NOTE: Rate limiting consideration - Smoobu has rate limits
 * TODO: Consider caching in KV for frequently accessed properties
 */

import type { SmoobuRatesResponse } from "@/schemas/smoobu";
import { useQuery } from "@tanstack/react-query";

// ============================================================================
// API Client Function
// ============================================================================

async function fetchSmoobuRates(params: {
  apartmentIds: number[];
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}): Promise<SmoobuRatesResponse> {
  const apartmentParams = params.apartmentIds
    .map((id) => `apartments[]=${id}`)
    .join("&");
  const url = `/api/smoobu/rates?${apartmentParams}&start_date=${params.startDate}&end_date=${params.endDate}`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = (await response.json()) as { error?: { message?: string } };
    throw new Error(error.error?.message || "Failed to fetch rates");
  }
  const json = (await response.json()) as { data: SmoobuRatesResponse };
  return json.data;
}

// ============================================================================
// Hook
// ============================================================================

interface UseSmoobuRatesParams {
  apartmentIds: number[];
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  enabled?: boolean;
}

export function useSmoobuRates({
  apartmentIds,
  startDate,
  endDate,
  enabled = true,
}: UseSmoobuRatesParams) {
  return useQuery({
    queryKey: ["smoobu-rates", apartmentIds, startDate, endDate],
    queryFn: () => fetchSmoobuRates({ apartmentIds, startDate, endDate }),
    enabled: enabled && apartmentIds.length > 0 && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes - rates don't change that frequently
    gcTime: 1000 * 60 * 10, // 10 minutes cache
  });
}
