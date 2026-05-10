import { fetchConnectStatus } from "@/features/broker/connect/api/client-server/connectApi";
import { useQuery } from "@tanstack/react-query";

export const connectQueryKeys = {
  all: ["connect"] as const,
  status: () => [...connectQueryKeys.all, "status"] as const,
};

const PENDING_POLL_INTERVAL = 5000;

export function useConnectStatus() {
  return useQuery({
    queryKey: connectQueryKeys.status(),
    queryFn: fetchConnectStatus,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? PENDING_POLL_INTERVAL : false,
  });
}
