import { queryExperiences } from "@/features/broker/experience/api/client-server";
import { experienceQueryKeys } from "@/features/broker/experience/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useExperiences(filters?: {
  search?: string;
  category?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: experienceQueryKeys.list(filters),
    queryFn: () => queryExperiences(filters),
  });
}
