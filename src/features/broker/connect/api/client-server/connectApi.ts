import type { ConnectStatus } from "@/features/broker/connect/api/server-handler/GETConnectStatus";

export async function createConnectAccount(): Promise<{ accountId: string }> {
  const response = await fetch("/api/backoffice/connect/account", {
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

export async function createAccountSession(): Promise<{
  clientSecret: string;
}> {
  const response = await fetch("/api/backoffice/connect/account-session", {
    method: "POST",
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: { clientSecret: string };
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to create account session");
  }
  return json.data as { clientSecret: string };
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
