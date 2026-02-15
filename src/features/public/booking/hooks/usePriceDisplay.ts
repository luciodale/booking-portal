import type { SmoobuAvailabilityResponse } from "@/schemas/smoobu";
import { useMemo } from "react";

const SUPPORTED_CURRENCIES = new Set(["EUR", "GBP", "USD"]);

const SYMBOL_TO_ISO: Record<string, string> = {
  "€": "EUR",
  "£": "GBP",
  $: "USD",
};

function normalizeIsoCurrency(raw: string): string | null {
  const iso = SYMBOL_TO_ISO[raw] ?? raw;
  return SUPPORTED_CURRENCIES.has(iso) ? iso : null;
}

type PriceDisplayInput = {
  checkIn: Date | null;
  checkOut: Date | null;
  smoobuPropertyId: number | null;
  currency: string | null;
  nightPriceCents: Record<string, number> | null;
  totalPriceCents: number | null;
  availabilityResult: SmoobuAvailabilityResponse | null;
  availabilityLoading: boolean;
  availabilityError: Error | null;
};

type ErrorInfo = {
  errorCode: number;
  message: string;
  minimumLengthOfStay?: number;
  numberOfGuest?: number;
  leadTime?: number;
  arrivalDays?: string[];
};

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

    return {
      status: "available",
      totalPriceCents,
      perNightCents: Math.round(totalPriceCents / nights),
      nights,
      currency: resolvedCurrency,
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
  ]);
}
