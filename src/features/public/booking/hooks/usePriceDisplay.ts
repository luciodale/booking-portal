import {
  formatDate,
  getDaysInRange,
} from "@/features/public/booking/domain/dateUtils";
import type {
  SmoobuAvailabilityResponse,
  SmoobuRateDay,
} from "@/schemas/smoobu";
import { differenceInDays } from "date-fns";
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
  rateMap: Record<string, SmoobuRateDay>;
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
      totalPrice: number;
      perNight: number;
      nights: number;
      currency: string;
    };

function computePriceFromRates(
  checkIn: Date,
  checkOut: Date,
  rateMap: Record<string, SmoobuRateDay>
): { total: number; perNight: number; nights: number; hasPricing: boolean } {
  const stayDays = getDaysInRange(checkIn, checkOut);
  const nights = stayDays.length;

  let total = 0;
  let pricedNights = 0;
  for (const day of stayDays) {
    const rate = rateMap[formatDate(day)];
    if (rate?.price != null) {
      total += rate.price;
      pricedNights++;
    }
  }

  if (pricedNights === 0) {
    return { total: 0, perNight: 0, nights, hasPricing: false };
  }

  if (pricedNights < nights) {
    const avgPerNight = total / pricedNights;
    total = Math.round(avgPerNight * nights);
  }

  return {
    total: Math.round(total),
    perNight: Math.round(total / nights),
    nights,
    hasPricing: true,
  };
}

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
  rateMap,
  availabilityResult,
  availabilityLoading,
  availabilityError,
}: PriceDisplayInput): PriceDisplayState {
  return useMemo(() => {
    if (!checkIn || !checkOut) return { status: "no-dates" };
    if (availabilityLoading) return { status: "loading" };
    if (availabilityError)
      return { status: "error", message: availabilityError.message };
    if (!availabilityResult || !smoobuPropertyId)
      return { status: "waiting" };

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

    const smoobuPrice = availabilityResult.prices[propId];
    const nights = differenceInDays(checkOut, checkIn);

    if (smoobuPrice) {
      const resolvedCurrency = normalizeIsoCurrency(
        smoobuPrice.currency || currency || ""
      );
      if (!resolvedCurrency) return { status: "available-no-price" };
      return {
        status: "available",
        totalPrice: smoobuPrice.price,
        perNight: Math.round(smoobuPrice.price / nights),
        nights,
        currency: resolvedCurrency,
      };
    }

    const rateResult = computePriceFromRates(checkIn, checkOut, rateMap);
    const resolvedCurrency = currency
      ? normalizeIsoCurrency(currency)
      : null;

    if (!rateResult.hasPricing || !resolvedCurrency) {
      return { status: "available-no-price" };
    }

    return {
      status: "available",
      totalPrice: rateResult.total,
      perNight: rateResult.perNight,
      nights: rateResult.nights,
      currency: resolvedCurrency,
    };
  }, [
    checkIn,
    checkOut,
    smoobuPropertyId,
    currency,
    rateMap,
    availabilityResult,
    availabilityLoading,
    availabilityError,
  ]);
}
