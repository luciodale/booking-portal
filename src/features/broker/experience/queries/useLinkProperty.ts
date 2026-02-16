import {
  linkProperty,
  unlinkProperty,
} from "@/features/broker/experience/api/client-server/linkProperty";
import { experienceQueryKeys } from "@/features/broker/experience/constants/queryKeys";
import { showSuccess } from "@/modules/ui/react/stores/notificationStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useLinkProperty(experienceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) =>
      linkProperty(experienceId, propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: experienceQueryKeys.detail(experienceId),
      });
      showSuccess("Property linked!");
    },
  });
}

export function useUnlinkProperty(experienceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) =>
      unlinkProperty(experienceId, propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: experienceQueryKeys.detail(experienceId),
      });
      showSuccess("Property unlinked!");
    },
  });
}
