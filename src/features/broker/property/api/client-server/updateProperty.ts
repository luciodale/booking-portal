import type {
  PropertyWithDetails,
  UpdatePropertyInput,
} from "@/features/broker/property/api/types";

export async function updateProperty(
  id: string,
  data: UpdatePropertyInput
): Promise<PropertyWithDetails> {
  const response = await fetch(`/api/backoffice/properties/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: PropertyWithDetails;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to update property");
  }
  return json.data as PropertyWithDetails;
}
