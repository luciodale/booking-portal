import type { PropertyListResponse } from "@/features/broker/property/api/types";

export async function queryProperties(params?: {
  search?: string;
  tier?: string;
  status?: string;
}): Promise<PropertyListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.tier) searchParams.set("tier", params.tier);
  if (params?.status) searchParams.set("status", params.status);

  const query = searchParams.toString();
  const url = `/api/backoffice/properties${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  const json = (await response.json()) as {
    success: boolean;
    data?: PropertyListResponse;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch properties");
  }
  return json.data as PropertyListResponse;
}
