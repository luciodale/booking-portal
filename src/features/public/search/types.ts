import type { Asset } from "@/db/schema";

export type SearchProperty = {
  asset: Asset;
  imageUrl: string;
  latitude: number;
  longitude: number;
};

export type TierFilter = "all" | "elite" | "premium";

export type PropertyPrice = {
  avgNightlyRate: number;
  currency: string;
  loading: boolean;
  error: boolean;
  available: boolean;
};
