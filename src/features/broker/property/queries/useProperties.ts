import { propertyApi } from "@/features/broker/property/api/client-server/propertyApi";
import type { PropertyListResponse } from "@/features/broker/property/api/types";
import { propertyQueryKeys } from "@/features/broker/property/constants/queryKeys";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

export function useProperties(
  params?: {
    search?: string;
    tier?: string;
    status?: string;
  },
  options?: Omit<UseQueryOptions<PropertyListResponse>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: propertyQueryKeys.list(params),
    queryFn: () => propertyApi.list(params),
    ...options,
  });
}
