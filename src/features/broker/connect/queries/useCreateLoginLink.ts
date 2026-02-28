import { createLoginLink } from "@/features/broker/connect/api/client-server/connectApi";
import { showError } from "@/modules/ui/react/stores/notificationStore";
import { useMutation } from "@tanstack/react-query";

export function useCreateLoginLink() {
  return useMutation({
    mutationFn: createLoginLink,
    onError: (error) => {
      showError(error.message);
    },
  });
}
