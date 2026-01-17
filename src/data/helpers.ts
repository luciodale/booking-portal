/**
 * Helper functions for data access and formatting
 */
import type { Experience, PricingRule } from "../db/schema";
import { mockAssets, mockExperiences, mockPricingRules } from "./mocks";
import type { AssetWithImages, LinkedExperience } from "./types";

// Asset lookups
export const getAssetById = (id: string): AssetWithImages | undefined =>
  mockAssets.find((asset) => asset.id === id);

export const getPricingRulesByAssetId = (assetId: string): PricingRule[] =>
  mockPricingRules.filter((rule) => rule.assetId === assetId);

export const getEliteAssets = (): AssetWithImages[] =>
  mockAssets.filter((asset) => asset.tier === "elite");

export const getStandardAssets = (): AssetWithImages[] =>
  mockAssets.filter((asset) => asset.tier === "standard");

export const getFeaturedAssets = (): AssetWithImages[] =>
  mockAssets.filter((asset) => asset.featured);

// Experience lookups
export const getExperienceById = (id: string): Experience | undefined =>
  mockExperiences.find((exp) => exp.id === id);

export const getFeaturedExperiences = (): Experience[] =>
  mockExperiences.filter((exp) => exp.featured);

export const getLinkedExperiences = (assetId: string): LinkedExperience[] =>
  mockExperiences.slice(0, 2).map((exp, idx) => ({
    ...exp,
    discountPercent: idx === 0 ? 15 : 10,
  }));

// Price formatting
export const getPriceInUnits = (priceInCents: number): number =>
  priceInCents / 100;

export const formatPrice = (priceInCents: number, currency = "eur"): string => {
  const price = priceInCents / 100;
  const symbol = currency === "eur" ? "€" : currency.toUpperCase();
  return `${symbol}${price.toLocaleString()}`;
};

// Category labels
export const experienceCategoryLabels: Record<string, string> = {
  sailing: "Sailing",
  food_wine: "Food & Wine",
  adventure: "Adventure",
  culture: "Culture",
  wellness: "Wellness",
  other: "Other",
};
