import { centsToUnit, multiplyCents } from "@/modules/money/money";
import { formatPrice } from "./dateUtils";
import type {
  ExperienceAdditionalCost,
  PriceLineItem,
  PropertyAdditionalCost,
  PropertyExtra,
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
          amountCents: multiplyCents(cost.amount, params.nights),
          detail: `${formatPrice(centsToUnit(cost.amount), params.currency)}/night`,
        };
      case "guest":
        return {
          label: cost.label,
          amountCents: multiplyCents(cost.amount, params.guests),
          detail: `${formatPrice(centsToUnit(cost.amount), params.currency)}/guest`,
        };
      case "night_per_guest": {
        const effectiveNights =
          cost.maxNights != null
            ? Math.min(params.nights, cost.maxNights)
            : params.nights;
        return {
          label: cost.label,
          amountCents: multiplyCents(
            multiplyCents(cost.amount, effectiveNights),
            params.guests
          ),
          detail: `${formatPrice(centsToUnit(cost.amount), params.currency)}/night/guest${cost.maxNights != null ? ` (max ${cost.maxNights} nights)` : ""}`,
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
          amountCents: multiplyCents(cost.amount, params.participants),
          detail: `${formatPrice(centsToUnit(cost.amount), params.currency)}/participant`,
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
    const rate = formatPrice(centsToUnit(cost.amount), currency);
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

export function computeExtrasTotal(
  extras: PropertyExtra[],
  selectedIndices: Set<number> | number[],
  params: { nights: number; guests: number; currency: string }
): PriceLineItem[] {
  const indices =
    selectedIndices instanceof Set
      ? selectedIndices
      : new Set(selectedIndices);
  if (indices.size === 0) return [];

  const items: PriceLineItem[] = [];
  for (const idx of indices) {
    const extra = extras[idx];
    if (!extra) continue;

    switch (extra.per) {
      case "stay":
        items.push({ label: extra.name, amountCents: extra.amount });
        break;
      case "night":
        items.push({
          label: extra.name,
          amountCents: multiplyCents(extra.amount, params.nights),
          detail: `${formatPrice(centsToUnit(extra.amount), params.currency)}/night`,
        });
        break;
      case "guest":
        items.push({
          label: extra.name,
          amountCents: multiplyCents(extra.amount, params.guests),
          detail: `${formatPrice(centsToUnit(extra.amount), params.currency)}/guest`,
        });
        break;
      case "night_per_guest": {
        const effectiveNights =
          extra.maxNights != null
            ? Math.min(params.nights, extra.maxNights)
            : params.nights;
        items.push({
          label: extra.name,
          amountCents: multiplyCents(
            multiplyCents(extra.amount, effectiveNights),
            params.guests
          ),
          detail: `${formatPrice(centsToUnit(extra.amount), params.currency)}/night/guest${extra.maxNights != null ? ` (max ${extra.maxNights} nights)` : ""}`,
        });
        break;
      }
    }
  }
  return items;
}
