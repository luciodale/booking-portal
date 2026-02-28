import type { TSafePmsIntegration } from "@/features/broker/pms/api/types";

export async function updateIntegrationApiKey(
  apiKey: string
): Promise<TSafePmsIntegration> {
  const response = await fetch("/api/backoffice/integrations", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });
  if (!response.ok) {
    const error = (await response.json()) as { error?: { message?: string } };
    throw new Error(error.error?.message ?? "Failed to update API key");
  }
  const json = (await response.json()) as {
    success: boolean;
    data: TSafePmsIntegration;
  };
  return json.data;
}
