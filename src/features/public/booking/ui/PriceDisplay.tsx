import { formatPrice } from "@/features/public/booking/domain/dateUtils";
import type { SmoobuAvailabilityResponse } from "@/schemas/smoobu";
import { differenceInDays } from "date-fns";

type PriceDisplayProps = {
  checkIn: Date | null;
  checkOut: Date | null;
  smoobuPropertyId: number | null;
  currency: string;
  availabilityResult: SmoobuAvailabilityResponse | null;
  availabilityLoading: boolean;
  availabilityError: Error | null;
};

export function PriceDisplay({
  checkIn,
  checkOut,
  smoobuPropertyId,
  currency,
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
      <div className="text-sm text-red-400">
        {availabilityError.message}
      </div>
    );
  }

  if (!availabilityResult || !smoobuPropertyId) return null;

  const propId = String(smoobuPropertyId);
  const isAvailable = availabilityResult.availableApartments.includes(smoobuPropertyId);

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

  const priceInfo = availabilityResult.prices[propId];
  if (!priceInfo) return null;

  const perNight = Math.round(priceInfo.price / nights);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(priceInfo.price, priceInfo.currency || currency)}
        </span>
        <span className="text-sm text-muted-foreground">total</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {formatPrice(perNight, priceInfo.currency || currency)}/night x {nights} night{nights !== 1 ? "s" : ""}
      </div>
      <div className="flex items-center gap-2 text-sm text-green-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Available for your dates
      </div>
    </div>
  );
}

function getErrorMessage(
  errorInfo?: {
    errorCode: number;
    message: string;
    minimumLengthOfStay?: number;
    numberOfGuest?: number;
    leadTime?: number;
    arrivalDays?: string[];
  }
): string {
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
