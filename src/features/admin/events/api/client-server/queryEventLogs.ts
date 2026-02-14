import type { EventLog } from "@/db/schema";

interface EventLogsResponse {
  logs: EventLog[];
  limit: number;
  offset: number;
}

interface QueryEventLogsParams {
  level?: string;
  source?: string;
  limit?: number;
  offset?: number;
}

export async function queryEventLogs(
  params: QueryEventLogsParams = {}
): Promise<EventLogsResponse> {
  const searchParams = new URLSearchParams();
  if (params.level) searchParams.set("level", params.level);
  if (params.source) searchParams.set("source", params.source);
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));

  const qs = searchParams.toString();
  const response = await fetch(`/api/admin/events${qs ? `?${qs}` : ""}`);
  if (!response.ok) throw new Error("Failed to fetch event logs");
  const json = (await response.json()) as { data: EventLogsResponse };
  return json.data;
}
