import { createAccountLink } from "@/features/broker/connect/api/client-server/connectApi";
import { showError } from "@/modules/ui/react/stores/notificationStore";
import { useMutation } from "@tanstack/react-query";

export function useCreateAccountLink() {
  return useMutation({
    mutationFn: createAccountLink,
    onError: (error) => {
      showError(error.message);
    },
  });
}
