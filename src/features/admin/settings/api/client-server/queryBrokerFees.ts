type BrokerFeeRow = {
  userId: string;
  email: string;
  name: string | null;
  feePercent: number;
};

type BrokerRow = {
  id: string;
  email: string;
  name: string | null;
};

export async function fetchBrokerFees(): Promise<BrokerFeeRow[]> {
  const response = await fetch("/api/admin/broker-fees");
  const json = (await response.json()) as {
    success: boolean;
    data?: BrokerFeeRow[];
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch broker fees");
  }
  return json.data as BrokerFeeRow[];
}

export async function upsertBrokerFee(
  userId: string,
  feePercent: number
): Promise<{ userId: string; feePercent: number }> {
  const response = await fetch("/api/admin/broker-fees", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, feePercent }),
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: { userId: string; feePercent: number };
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to save broker fee");
  }
  return json.data as { userId: string; feePercent: number };
}

export async function deleteBrokerFee(
  userId: string
): Promise<{ deleted: boolean }> {
  const response = await fetch("/api/admin/broker-fees", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: { deleted: boolean };
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to delete broker fee");
  }
  return json.data as { deleted: boolean };
}

export async function fetchBrokers(): Promise<BrokerRow[]> {
  const response = await fetch("/api/admin/brokers");
  const json = (await response.json()) as {
    success: boolean;
    data?: BrokerRow[];
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch brokers");
  }
  return json.data as BrokerRow[];
}
