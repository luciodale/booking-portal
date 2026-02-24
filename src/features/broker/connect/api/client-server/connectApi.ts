import type { ConnectStatus } from "@/features/broker/connect/api/server-handler/GETConnectStatus";

export async function createConnectAccount(
  { replace = false }: { replace?: boolean } = {}
): Promise<{ accountId: string }> {
  const params = replace ? "?replace=true" : "";
  const response = await fetch(`/api/backoffice/connect/account${params}`, {
    method: "POST",
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: { accountId: string };
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to create connect account");
  }
  return json.data as { accountId: string };
}

export async function createAccountLink(): Promise<{ url: string }> {
  const response = await fetch("/api/backoffice/connect/account-link", {
    method: "POST",
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: { url: string };
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to create account link");
  }
  return json.data as { url: string };
}

export async function fetchConnectStatus(): Promise<ConnectStatus> {
  const response = await fetch("/api/backoffice/connect/status");
  const json = (await response.json()) as {
    success: boolean;
    data?: ConnectStatus;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch connect status");
  }
  return json.data as ConnectStatus;
}
