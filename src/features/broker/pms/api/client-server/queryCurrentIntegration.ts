import type { TGetIntegrationsResponse } from "@/features/broker/pms/api/types";

export async function queryCurrentIntegration(): Promise<TGetIntegrationsResponse> {
  const response = await fetch("/api/backoffice/integrations");
  if (!response.ok) throw new Error("Failed to check integration status");
  const json = (await response.json()) as { data: TGetIntegrationsResponse };
  return json.data;
}
