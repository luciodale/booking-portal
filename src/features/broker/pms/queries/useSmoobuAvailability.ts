import { checkSmoobuAvailability } from "@/features/broker/pms/api/client-server/checkSmoobuAvailability";
import type { TPostSmoobuAvailabilityRequest } from "@/features/broker/pms/api/types";
import { useMutation } from "@tanstack/react-query";

export function useSmoobuAvailability() {
  return useMutation({
    mutationFn: (params: TPostSmoobuAvailabilityRequest) =>
      checkSmoobuAvailability(params),
  });
}
