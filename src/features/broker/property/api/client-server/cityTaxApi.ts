import type { CityTaxDefault } from "@/db/schema";

type UpsertCityTaxInput = {
  city: string;
  country: string;
  amount: number;
  maxNights: number | null;
};

export async function fetchCityTaxDefault(
  city: string,
  country: string
): Promise<CityTaxDefault | null> {
  const params = new URLSearchParams({ city, country });
  const response = await fetch(`/api/backoffice/city-tax?${params}`);
  const json = (await response.json()) as {
    success: boolean;
    data?: CityTaxDefault | null;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch city tax default");
  }
  return json.data ?? null;
}

export async function upsertCityTaxDefault(
  input: UpsertCityTaxInput
): Promise<CityTaxDefault> {
  const response = await fetch("/api/backoffice/city-tax", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: CityTaxDefault;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to upsert city tax");
  }
  return json.data as CityTaxDefault;
}
