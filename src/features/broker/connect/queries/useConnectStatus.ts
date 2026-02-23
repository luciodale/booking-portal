import { fetchConnectStatus } from "@/features/broker/connect/api/client-server/connectApi";
import { useQuery } from "@tanstack/react-query";

export const connectQueryKeys = {
  all: ["connect"] as const,
  status: () => [...connectQueryKeys.all, "status"] as const,
};

export function useConnectStatus() {
  return useQuery({
    queryKey: connectQueryKeys.status(),
    queryFn: fetchConnectStatus,
  });
}
