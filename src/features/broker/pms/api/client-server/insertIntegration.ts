import type {
  TPostIntegrationsRequest,
  TPostIntegrationsResponse,
} from "@/features/broker/pms/api/types";

export async function insertIntegration(
  params: TPostIntegrationsRequest
): Promise<TPostIntegrationsResponse> {
  const response = await fetch("/api/backoffice/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const error = (await response.json()) as { error?: { message?: string } };
    throw new Error(error.error?.message ?? "Failed to save integration");
  }
  const json = (await response.json()) as {
    success: boolean;
    data: TPostIntegrationsResponse;
  };
  return json.data;
}
