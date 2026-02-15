import { formatPrice } from "./dateUtils";
import type {
  ExperienceAdditionalCost,
  PriceLineItem,
  PropertyAdditionalCost,
} from "./pricingTypes";

export function computePropertyAdditionalCosts(
  costs: PropertyAdditionalCost[] | null,
  params: { nights: number; guests: number; currency: string }
): PriceLineItem[] {
  if (!costs || costs.length === 0) return [];

  return costs.map((cost) => {
    switch (cost.per) {
      case "stay":
        return { label: cost.label, amountCents: cost.amount };
      case "night":
        return {
          label: cost.label,
          amountCents: cost.amount * params.nights,
          detail: `${formatPrice(cost.amount / 100, params.currency)}/night`,
        };
      case "guest":
        return {
          label: cost.label,
          amountCents: cost.amount * params.guests,
          detail: `${formatPrice(cost.amount / 100, params.currency)}/guest`,
        };
      case "night_per_guest": {
        const effectiveNights =
          cost.maxNights != null
            ? Math.min(params.nights, cost.maxNights)
            : params.nights;
        return {
          label: cost.label,
          amountCents: cost.amount * effectiveNights * params.guests,
          detail: `${formatPrice(cost.amount / 100, params.currency)}/night/guest${cost.maxNights != null ? ` (max ${cost.maxNights} nights)` : ""}`,
        };
      }
    }
  });
}

export function computeExperienceAdditionalCosts(
  costs: ExperienceAdditionalCost[] | null,
  params: { participants: number; currency: string }
): PriceLineItem[] {
  if (!costs || costs.length === 0) return [];

  return costs.map((cost) => {
    switch (cost.per) {
      case "booking":
        return { label: cost.label, amountCents: cost.amount };
      case "participant":
        return {
          label: cost.label,
          amountCents: cost.amount * params.participants,
          detail: `${formatPrice(cost.amount / 100, params.currency)}/participant`,
        };
    }
  });
}

export function formatPropertyCostPreview(
  costs: PropertyAdditionalCost[] | null,
  currency: string
): PriceLineItem[] {
  if (!costs || costs.length === 0) return [];

  return costs.map((cost) => {
    const rate = formatPrice(cost.amount / 100, currency);
    switch (cost.per) {
      case "stay":
        return { label: cost.label, amountCents: cost.amount };
      case "night":
        return { label: cost.label, amountCents: 0, detail: `${rate}/night` };
      case "guest":
        return { label: cost.label, amountCents: 0, detail: `${rate}/guest` };
      case "night_per_guest":
        return {
          label: cost.label,
          amountCents: 0,
          detail: `${rate}/night/guest${cost.maxNights != null ? ` (max ${cost.maxNights} nights)` : ""}`,
        };
    }
  });
}
