import type {
  CreatePropertyInput,
  PropertyWithDetails,
} from "@/features/broker/property/api/types";

export async function createProperty(
  data: CreatePropertyInput
): Promise<PropertyWithDetails> {
  const response = await fetch("/api/backoffice/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: PropertyWithDetails;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to create property");
  }
  return json.data as PropertyWithDetails;
}
