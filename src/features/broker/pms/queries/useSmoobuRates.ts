import { fetchSmoobuRates } from "@/features/broker/pms/api/client-server/fetchSmoobuRates";
import { useQuery } from "@tanstack/react-query";

export function useSmoobuRates(params: {
  smoobuPropertyId: number | undefined;
  startDate: string;
  endDate: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [
      "smoobu-rates",
      params.smoobuPropertyId,
      params.startDate,
      params.endDate,
    ],
    queryFn: () =>
      fetchSmoobuRates({
        smoobuPropertyId: params.smoobuPropertyId as number,
        startDate: params.startDate,
        endDate: params.endDate,
      }),
    enabled:
      (params.enabled ?? true) &&
      !!params.smoobuPropertyId &&
      !!params.startDate &&
      !!params.endDate,
  });
}
