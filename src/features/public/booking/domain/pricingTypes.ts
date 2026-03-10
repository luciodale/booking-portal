import type { Asset, Experience } from "@/db/schema";

export type PropertyAdditionalCost = NonNullable<
  Asset["additionalCosts"]
>[number];

export type PropertyExtra = NonNullable<Asset["extras"]>[number];

export type ExperienceAdditionalCost = NonNullable<
  Experience["additionalCosts"]
>[number];

export type PriceLineItem = {
  label: string;
  amountCents: number;
  detail?: string;
};

export type CityTax = {
  amount: number;
  maxNights: number | null;
};
