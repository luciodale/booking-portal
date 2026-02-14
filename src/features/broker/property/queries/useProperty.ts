import { propertyApi } from "@/features/broker/property/api/client-server/propertyApi";
import type { PropertyWithDetails } from "@/features/broker/property/api/types";
import { propertyQueryKeys } from "@/features/broker/property/constants/queryKeys";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

export function useProperty(
  id: string,
  options?: Omit<UseQueryOptions<PropertyWithDetails>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: propertyQueryKeys.detail(id),
    queryFn: () => propertyApi.get(id),
    enabled: !!id,
    ...options,
  });
}
