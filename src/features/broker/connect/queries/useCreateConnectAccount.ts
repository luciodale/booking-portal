import { createConnectAccount } from "@/features/broker/connect/api/client-server/connectApi";
import { connectQueryKeys } from "@/features/broker/connect/queries/useConnectStatus";
import { showError } from "@/modules/ui/react/stores/notificationStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateConnectAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConnectAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectQueryKeys.status() });
    },
    onError: (error) => {
      showError(error.message);
    },
  });
}
