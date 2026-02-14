import type { ExperienceListResponse } from "@/schemas/api";

export async function queryExperiences(params?: {
  search?: string;
  category?: string;
  status?: string;
}): Promise<ExperienceListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.status) searchParams.set("status", params.status);

  const query = searchParams.toString();
  const url = `/api/backoffice/experiences${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  const json = (await response.json()) as {
    success: boolean;
    data?: ExperienceListResponse;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch experiences");
  }
  return json.data as ExperienceListResponse;
}
