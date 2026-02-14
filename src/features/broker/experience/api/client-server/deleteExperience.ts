export async function deleteExperience(id: string): Promise<void> {
  const response = await fetch(`/api/backoffice/experiences/${id}`, {
    method: "DELETE",
  });
  const json = (await response.json()) as {
    success: boolean;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to archive experience");
  }
}
