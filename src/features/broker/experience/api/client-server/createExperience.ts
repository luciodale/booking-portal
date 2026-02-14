import type { CreateExperienceInput, ExperienceWithDetails } from "@/schemas/experience";

export async function createExperience(
  data: CreateExperienceInput
): Promise<ExperienceWithDetails> {
  const response = await fetch("/api/backoffice/experiences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: ExperienceWithDetails;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to create experience");
  }
  return json.data as ExperienceWithDetails;
}
