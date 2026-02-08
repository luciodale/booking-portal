import type {
  IntegrationStatusResponse,
  SaveIntegrationParams,
} from "@/features/broker/pms/api/types";

export async function checkIntegrationStatus(): Promise<IntegrationStatusResponse> {
  const response = await fetch("/api/backoffice/integrations");
  if (!response.ok) throw new Error("Failed to check integration status");
  const json = (await response.json()) as { data: IntegrationStatusResponse };
  return json.data;
}

export async function saveIntegration(
  params: SaveIntegrationParams
): Promise<void> {
  const response = await fetch("/api/backoffice/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const error = (await response.json()) as { error?: { message?: string } };
    throw new Error(error.error?.message ?? "Failed to save integration");
  }
}
