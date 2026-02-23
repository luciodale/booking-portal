import { createAccountSession } from "@/features/broker/connect/api/client-server/connectApi";
import { showError } from "@/modules/ui/react/stores/notificationStore";
import { useMutation } from "@tanstack/react-query";

export function useCreateAccountSession() {
  return useMutation({
    mutationFn: createAccountSession,
    onError: (error) => {
      showError(error.message);
    },
  });
}
