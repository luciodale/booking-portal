import { formatPrice } from "@/features/public/booking/domain/dateUtils";
import { usePriceDisplay } from "@/features/public/booking/hooks/usePriceDisplay";
import type {
  SmoobuAvailabilityResponse,
  SmoobuRateDay,
} from "@/schemas/smoobu";

type PriceDisplayProps = {
  checkIn: Date | null;
  checkOut: Date | null;
  smoobuPropertyId: number | null;
  currency: string | null;
  rateMap: Record<string, SmoobuRateDay>;
  availabilityResult: SmoobuAvailabilityResponse | null;
  availabilityLoading: boolean;
  availabilityError: Error | null;
};

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
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
  );
}

function AvailableBadge() {
  return (
    <div className="flex items-center gap-2 text-sm text-green-400">
      <CheckIcon />
      Available for your dates
    </div>
  );
}

export function PriceDisplay(props: PriceDisplayProps) {
  const state = usePriceDisplay(props);

  switch (state.status) {
    case "no-dates":
    case "waiting":
      return (
        <div className="text-sm text-muted-foreground">
          Select dates to see pricing
        </div>
      );

    case "loading":
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
          Checking availability...
        </div>
      );

    case "error":
      return (
        <div className="text-sm text-red-400">{state.message}</div>
      );

    case "unavailable":
      return (
        <div className="space-y-2">
          <div className="text-sm text-red-400 font-medium">
            {state.message}
          </div>
          <div className="text-xs text-muted-foreground">
            Try selecting different dates
          </div>
        </div>
      );

    case "available-no-price":
      return (
        <div className="space-y-3">
          <AvailableBadge />
          <div className="text-sm text-muted-foreground">
            Contact host for pricing
          </div>
        </div>
      );

    case "available":
      return (
        <div className="space-y-3">
          <div data-testid="price-total" className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(state.totalPriceCents / 100, state.currency)}
            </span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatPrice(state.perNightCents / 100, state.currency)}/night x{" "}
            {state.nights} night
            {state.nights !== 1 ? "s" : ""}
          </div>
          <AvailableBadge />
        </div>
      );
  }
}
