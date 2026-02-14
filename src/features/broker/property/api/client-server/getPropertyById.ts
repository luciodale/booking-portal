import type { PropertyWithDetails } from "@/features/broker/property/api/types";

export async function getPropertyById(
  id: string
): Promise<PropertyWithDetails> {
  const response = await fetch(`/api/backoffice/properties/${id}`);
  const json = (await response.json()) as {
    success: boolean;
    data?: PropertyWithDetails;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch property");
  }
  return json.data as PropertyWithDetails;
}
