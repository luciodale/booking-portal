import type {
  ExperienceWithDetails,
  UpdateExperienceInput,
} from "@/schemas/experience";

export async function updateExperience(
  id: string,
  data: UpdateExperienceInput
): Promise<ExperienceWithDetails> {
  const response = await fetch(`/api/backoffice/experiences/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: ExperienceWithDetails;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to update experience");
  }
  return json.data as ExperienceWithDetails;
}
