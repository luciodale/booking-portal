import type { ExperienceWithDetails } from "@/schemas/experience";

export async function getExperienceById(
  id: string
): Promise<ExperienceWithDetails> {
  const response = await fetch(`/api/backoffice/experiences/${id}`);
  const json = (await response.json()) as {
    success: boolean;
    data?: ExperienceWithDetails;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch experience");
  }
  return json.data as ExperienceWithDetails;
}
