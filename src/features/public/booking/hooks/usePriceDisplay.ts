import {
  computeExtrasTotal,
  computePropertyAdditionalCosts,
  formatPropertyCostPreview,
} from "@/features/public/booking/domain/computeAdditionalCosts";
import { formatPrice } from "@/features/public/booking/domain/dateUtils";
import type {
  CityTax,
  PriceLineItem,
  PropertyAdditionalCost,
  PropertyExtra,
} from "@/features/public/booking/domain/pricingTypes";
import type { SmoobuAvailabilityResponse } from "@/schemas/smoobu";
import { useMemo } from "react";

const SUPPORTED_CURRENCIES = new Set(["EUR", "GBP", "USD"]);

const SYMBOL_TO_ISO: Record<string, string> = {
  "\u20AC": "EUR",
  "\u00A3": "GBP",
  $: "USD",
};

function normalizeIsoCurrency(raw: string): string | null {
  const iso = SYMBOL_TO_ISO[raw] ?? raw;
  return SUPPORTED_CURRENCIES.has(iso) ? iso : null;
}

type PriceDisplayInput = {
  checkIn: string | null;
  checkOut: string | null;
  smoobuPropertyId: number | null;
  currency: string | null;
  nightPriceCents: Record<string, number> | null;
  totalPriceCents: number | null;
  availabilityResult: SmoobuAvailabilityResponse | null;
  availabilityLoading: boolean;
  availabilityError: Error | null;
  additionalCosts?: PropertyAdditionalCost[] | null;
  extras?: PropertyExtra[] | null;
  selectedExtras?: Set<number>;
  guests?: number | null;
  cityTax?: CityTax | null;
};

type ErrorInfo = {
  errorCode: number;
  message: string;
  minimumLengthOfStay?: number;
  numberOfGuest?: number;
  leadTime?: number;
  arrivalDays?: string[];
};

export type ExtraLineItem = PriceLineItem & { extraIndex: number };

type PriceDisplayState =
  | { status: "no-dates" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "waiting" }
  | { status: "unavailable"; message: string }
  | { status: "available-no-price" }
  | {
      status: "available";
      totalPriceCents: number;
      perNightCents: number;
      nights: number;
      currency: string;
      additionalCostItems: PriceLineItem[];
      extraItems: ExtraLineItem[];
      grandTotalCents: number;
    };

function getUnavailableMessage(errorInfo?: ErrorInfo): string {
  if (!errorInfo) return "Not available for selected dates";

  switch (errorInfo.errorCode) {
    case 1:
      return `Minimum stay is ${errorInfo.minimumLengthOfStay ?? "?"} nights`;
    case 2:
      return `Maximum ${errorInfo.numberOfGuest ?? "?"} guests allowed`;
    case 3:
      return `Requires ${errorInfo.leadTime ?? "?"} days advance booking`;
    case 4: {
      const days = errorInfo.arrivalDays?.join(", ") ?? "";
      return `Check-in only on: ${days}`;
    }
    default:
      return errorInfo.message || "Not available for selected dates";
  }
}

export function usePriceDisplay({
  checkIn,
  checkOut,
  smoobuPropertyId,
  currency,
  nightPriceCents,
  totalPriceCents,
  availabilityResult,
  availabilityLoading,
  availabilityError,
  additionalCosts,
  extras,
  selectedExtras,
  guests,
  cityTax,
}: PriceDisplayInput): PriceDisplayState {
  return useMemo(() => {
    if (!checkIn || !checkOut) return { status: "no-dates" };
    if (availabilityLoading) return { status: "loading" };
    if (availabilityError)
      return { status: "error", message: availabilityError.message };
    if (!availabilityResult || !smoobuPropertyId) return { status: "waiting" };

    const propId = String(smoobuPropertyId);
    const isAvailable =
      availabilityResult.availableApartments.includes(smoobuPropertyId);

    if (!isAvailable) {
      return {
        status: "unavailable",
        message: getUnavailableMessage(
          availabilityResult.errorMessages[propId]
        ),
      };
    }

    if (!nightPriceCents || totalPriceCents == null || !currency) {
      return { status: "available-no-price" };
    }

    const resolvedCurrency = normalizeIsoCurrency(currency);
    if (!resolvedCurrency) return { status: "available-no-price" };

    const nights = Object.keys(nightPriceCents).length;

    // Compute additional costs
    let additionalCostItems: PriceLineItem[];
    if (guests != null && guests > 0) {
      additionalCostItems = computePropertyAdditionalCosts(
        additionalCosts ?? null,
        { nights, guests, currency: resolvedCurrency }
      );
    } else {
      additionalCostItems = formatPropertyCostPreview(
        additionalCosts ?? null,
        resolvedCurrency
      );
    }

    // Compute extras (kept separate for removable UI)
    let extraItems: ExtraLineItem[] = [];
    if (extras && selectedExtras && selectedExtras.size > 0 && guests != null && guests > 0) {
      const rawExtrasItems = computeExtrasTotal(extras, selectedExtras, {
        nights,
        guests,
        currency: resolvedCurrency,
      });
      // Tag each item with its original extra index
      const selectedArr = Array.from(selectedExtras);
      extraItems = rawExtrasItems.map((item, i) => ({
        ...item,
        extraIndex: selectedArr[i],
      }));
    }

    const additionalTotalCents = additionalCostItems.reduce(
      (sum, item) => sum + item.amountCents,
      0
    );
    const extrasTotalCents = extraItems.reduce(
      (sum, item) => sum + item.amountCents,
      0
    );

    // Compute city tax
    let cityTaxCents = 0;
    if (cityTax && cityTax.amount > 0 && guests != null && guests > 0) {
      const effectiveNights =
        cityTax.maxNights != null
          ? Math.min(nights, cityTax.maxNights)
          : nights;
      cityTaxCents = cityTax.amount * effectiveNights * guests;
      additionalCostItems.push({
        label: "City Tax",
        amountCents: cityTaxCents,
        detail: `${formatPrice(cityTax.amount / 100, resolvedCurrency)}/night/guest${cityTax.maxNights != null ? ` (max ${cityTax.maxNights} nights)` : ""}`,
      });
    }

    return {
      status: "available",
      totalPriceCents,
      perNightCents: Math.round(totalPriceCents / nights),
      nights,
      currency: resolvedCurrency,
      additionalCostItems,
      extraItems,
      grandTotalCents: totalPriceCents + additionalTotalCents + extrasTotalCents + cityTaxCents,
    };
  }, [
    checkIn,
    checkOut,
    smoobuPropertyId,
    currency,
    nightPriceCents,
    totalPriceCents,
    availabilityResult,
    availabilityLoading,
    availabilityError,
    additionalCosts,
    extras,
    selectedExtras,
    guests,
    cityTax,
  ]);
}
