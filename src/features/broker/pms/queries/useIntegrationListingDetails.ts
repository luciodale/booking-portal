import { getIntegrationListingById } from "@/features/broker/pms/api/client-server/getIntegrationListingById";
import { integrationListingDetailKey } from "@/features/broker/pms/constants/integrations";
import { useQuery } from "@tanstack/react-query";

export function useIntegrationListingDetails(id: number | null) {
  return useQuery({
    queryKey: integrationListingDetailKey(id ?? 0),
    queryFn: () => getIntegrationListingById(id!),
    enabled: id != null && Number.isInteger(id) && id > 0,
  });
}
