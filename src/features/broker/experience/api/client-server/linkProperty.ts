export async function linkProperty(
  experienceId: string,
  propertyId: string
): Promise<void> {
  const response = await fetch(
    `/api/backoffice/experiences/${experienceId}/link-property`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    }
  );
  const json = (await response.json()) as {
    success: boolean;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to link property");
  }
}

export async function unlinkProperty(
  experienceId: string,
  propertyId: string
): Promise<void> {
  const response = await fetch(
    `/api/backoffice/experiences/${experienceId}/link-property`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    }
  );
  const json = (await response.json()) as {
    success: boolean;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to unlink property");
  }
}
