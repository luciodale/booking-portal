import { queryCurrentIntegration } from "@/features/broker/pms/api/client-server/queryCurrentIntegration";
import { useQuery } from "@tanstack/react-query";
import { PMS_INTEGRATION_STATUS_QUERY_KEY } from "../constants/integrations";

export function useIsPmsIntegrated() {
  const { data: integrationStatus, isLoading } = useQuery({
    queryKey: PMS_INTEGRATION_STATUS_QUERY_KEY,
    queryFn: queryCurrentIntegration,
  });
  const isIntegrated = integrationStatus?.hasIntegration ?? false;
  return { integrationStatus, isLoading, isIntegrated };
}
