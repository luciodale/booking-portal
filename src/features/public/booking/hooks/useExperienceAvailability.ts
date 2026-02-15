import {
  type ExperienceAvailabilityMap,
  fetchExperienceAvailability,
} from "@/features/public/booking/api/fetchExperienceAvailability";
import {
  addMonths,
  formatDate,
} from "@/features/public/booking/domain/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

function toMonthKey(date: Date): string {
  return formatDate(date).slice(0, 7);
}

export function useExperienceAvailability(
  experienceId: string,
  currentMonth: Date
) {
  const month0 = toMonthKey(currentMonth);
  const month1 = toMonthKey(addMonths(currentMonth, 1));

  const q0 = useQuery({
    queryKey: ["experience-availability", experienceId, month0],
    queryFn: () => fetchExperienceAvailability(experienceId, month0),
    staleTime: 2 * 60 * 1000,
  });

  const q1 = useQuery({
    queryKey: ["experience-availability", experienceId, month1],
    queryFn: () => fetchExperienceAvailability(experienceId, month1),
    staleTime: 2 * 60 * 1000,
  });

  const availabilityMap = useMemo<ExperienceAvailabilityMap>(() => {
    return { ...(q0.data ?? {}), ...(q1.data ?? {}) };
  }, [q0.data, q1.data]);

  return {
    availabilityMap,
    isLoading: q0.isLoading || q1.isLoading,
    isError: q0.isError || q1.isError,
  };
}
