import { fetchPropertyRates } from "@/features/public/booking/api/fetchPropertyRates";
import { useQuery } from "@tanstack/react-query";

export function usePropertyRates(params: {
  propertyId: string;
  startDate: string;
  endDate: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [
      "property-rates",
      params.propertyId,
      params.startDate,
      params.endDate,
    ],
    queryFn: () =>
      fetchPropertyRates(params.propertyId, params.startDate, params.endDate),
    enabled: (params.enabled ?? true) && !!params.startDate && !!params.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
