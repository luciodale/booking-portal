import { queryEventLogs } from "@/features/admin/events/api/client-server/queryEventLogs";
import { useQuery } from "@tanstack/react-query";

interface UseEventLogsParams {
  level?: string;
  source?: string;
}

export function useEventLogs(params: UseEventLogsParams = {}) {
  return useQuery({
    queryKey: ["admin", "event-logs", params.level, params.source],
    queryFn: () =>
      queryEventLogs({
        level: params.level || undefined,
        source: params.source || undefined,
        limit: 200,
      }),
    refetchInterval: 30_000,
  });
}
