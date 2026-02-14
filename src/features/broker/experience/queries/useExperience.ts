import { getExperienceById } from "@/features/broker/experience/api/client-server";
import { experienceQueryKeys } from "@/features/broker/experience/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useExperience(id: string) {
  return useQuery({
    queryKey: experienceQueryKeys.detail(id),
    queryFn: () => getExperienceById(id),
    enabled: !!id,
  });
}
