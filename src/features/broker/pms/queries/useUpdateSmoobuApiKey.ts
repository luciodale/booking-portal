import { updateIntegrationApiKey } from "@/features/broker/pms/api/client-server/updateIntegrationApiKey";
import { PMS_INTEGRATION_STATUS_QUERY_KEY } from "@/features/broker/pms/constants/integrations";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateSmoobuApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (apiKey: string) => updateIntegrationApiKey(apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PMS_INTEGRATION_STATUS_QUERY_KEY,
      });
    },
  });
}
