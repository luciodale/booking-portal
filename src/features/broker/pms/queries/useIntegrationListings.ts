import { queryIntegrationListings } from "@/features/broker/pms/api/client-server/queryIntegrationListings";
import { INTEGRATION_LISTINGS_QUERY_KEY } from "@/features/broker/pms/constants/integrations";
import { useQuery } from "@tanstack/react-query";

export function useIntegrationListings(enabled: boolean) {
  return useQuery({
    queryKey: INTEGRATION_LISTINGS_QUERY_KEY,
    queryFn: queryIntegrationListings,
    enabled,
  });
}
