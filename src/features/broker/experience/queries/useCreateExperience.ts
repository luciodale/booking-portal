import { createExperience } from "@/features/broker/experience/api/client-server";
import { experienceQueryKeys } from "@/features/broker/experience/constants/queryKeys";
import { showSuccess } from "@/modules/ui/react/stores/notificationStore";
import type { CreateExperienceInput } from "@/schemas/experience";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExperienceInput) => createExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienceQueryKeys.lists() });
      showSuccess("Experience created successfully!");
    },
  });
}
