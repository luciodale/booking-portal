import { updateExperience } from "@/features/broker/experience/api/client-server/updateExperience";
import { experienceQueryKeys } from "@/features/broker/experience/constants/queryKeys";
import { showSuccess } from "@/modules/ui/react/stores/notificationStore";
import type { UpdateExperienceInput } from "@/schemas/experience";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExperienceInput }) =>
      updateExperience(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: experienceQueryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: experienceQueryKeys.lists() });
      showSuccess("Experience updated!");
    },
  });
}
