export async function fetchSettings(): Promise<Record<string, string>> {
  const response = await fetch("/api/admin/settings");
  const json = (await response.json()) as {
    success: boolean;
    data?: Record<string, string>;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch settings");
  }
  return json.data as Record<string, string>;
}

export async function updateSetting(
  key: string,
  value: string
): Promise<{ key: string; value: string }> {
  const response = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: { key: string; value: string };
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to update setting");
  }
  return json.data as { key: string; value: string };
}
