import {
  formatDate,
  formatPrice,
  getDaysInRange,
} from "@/features/public/booking/domain/dateUtils";
import type {
  SmoobuAvailabilityResponse,
  SmoobuRateDay,
} from "@/schemas/smoobu";
import { differenceInDays } from "date-fns";

type PriceDisplayProps = {
  checkIn: Date | null;
  checkOut: Date | null;
  smoobuPropertyId: number | null;
  currency: string;
  rateMap: Record<string, SmoobuRateDay>;
  availabilityResult: SmoobuAvailabilityResponse | null;
  availabilityLoading: boolean;
  availabilityError: Error | null;
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

  // If some nights lack a rate, extrapolate from the average of priced nights
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

export function PriceDisplay({
  checkIn,
  checkOut,
  smoobuPropertyId,
  currency,
  rateMap,
  availabilityResult,
  availabilityLoading,
  availabilityError,
}: PriceDisplayProps) {
  if (!checkIn || !checkOut) {
    return (
      <div className="text-sm text-muted-foreground">
        Select dates to see pricing
      </div>
    );
  }

  const nights = differenceInDays(checkOut, checkIn);

  if (availabilityLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
        Checking availability...
      </div>
    );
  }

  if (availabilityError) {
    return (
      <div className="text-sm text-red-400">{availabilityError.message}</div>
    );
  }

  if (!availabilityResult || !smoobuPropertyId) {
    return (
      <div className="text-sm text-muted-foreground">
        Select dates to see pricing
      </div>
    );
  }

  const propId = String(smoobuPropertyId);
  const isAvailable =
    availabilityResult.availableApartments.includes(smoobuPropertyId);

  if (!isAvailable) {
    const errorInfo = availabilityResult.errorMessages[propId];
    const message = getErrorMessage(errorInfo);
    return (
      <div className="space-y-2">
        <div className="text-sm text-red-400 font-medium">{message}</div>
        <div className="text-xs text-muted-foreground">
          Try selecting different dates
        </div>
      </div>
    );
  }

  // Use Smoobu availability price if present, otherwise compute from rate map
  const smoobuPrice = availabilityResult.prices[propId];
  let totalPrice: number;
  let perNight: number;
  let priceCurrency = currency;
  let hasPricing = true;

  if (smoobuPrice) {
    totalPrice = smoobuPrice.price;
    perNight = Math.round(smoobuPrice.price / nights);
    priceCurrency = smoobuPrice.currency || currency;
  } else {
    const rateResult = computePriceFromRates(checkIn, checkOut, rateMap);
    totalPrice = rateResult.total;
    perNight = rateResult.perNight;
    hasPricing = rateResult.hasPricing;
  }

  if (!hasPricing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-green-400">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Available for your dates
        </div>
        <div className="text-sm text-muted-foreground">
          Contact host for pricing
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div data-testid="price-total" className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(totalPrice, priceCurrency)}
        </span>
        <span className="text-sm text-muted-foreground">total</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {formatPrice(perNight, priceCurrency)}/night x {nights} night
        {nights !== 1 ? "s" : ""}
      </div>
      <div className="flex items-center gap-2 text-sm text-green-400">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Available for your dates
      </div>
    </div>
  );
}

function getErrorMessage(errorInfo?: {
  errorCode: number;
  message: string;
  minimumLengthOfStay?: number;
  numberOfGuest?: number;
  leadTime?: number;
  arrivalDays?: string[];
}): string {
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
