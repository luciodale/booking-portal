import { deleteExperience } from "@/features/broker/experience/api/client-server";
import { experienceQueryKeys } from "@/features/broker/experience/constants/queryKeys";
import { showSuccess } from "@/modules/ui/react/stores/notificationStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienceQueryKeys.lists() });
      showSuccess("Experience archived.");
    },
  });
}
