import { checkIntegrationStatus } from "@/features/broker/pms/api";
import { useQuery } from "@tanstack/react-query";
import { PMS_INTEGRATION_STATUS_QUERY_KEY } from "../constants/integrations";

export function useIsPmsIntegrated() {
  const { data: integrationStatus, isLoading } = useQuery({
    queryKey: PMS_INTEGRATION_STATUS_QUERY_KEY,
    queryFn: checkIntegrationStatus,
  });
  const isIntegrated = integrationStatus?.hasIntegration ?? false;
  return { integrationStatus, isLoading, isIntegrated };
}
