export type PropertyAdditionalCost = {
  label: string;
  amount: number;
  per: "stay" | "night" | "guest" | "night_per_guest";
  maxNights?: number;
};

export type ExperienceAdditionalCost = {
  label: string;
  amount: number;
  per: "booking" | "participant";
};

export type PriceLineItem = {
  label: string;
  amountCents: number;
  detail?: string;
};
