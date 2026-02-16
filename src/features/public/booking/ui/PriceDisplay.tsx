import { formatPrice } from "@/features/public/booking/domain/dateUtils";
import type {
  CityTax,
  PropertyAdditionalCost,
  PropertyExtra,
} from "@/features/public/booking/domain/pricingTypes";
import { usePriceDisplay } from "@/features/public/booking/hooks/usePriceDisplay";
import { PriceBreakdown } from "@/features/public/booking/ui/PriceBreakdown";
import type { SmoobuAvailabilityResponse } from "@/schemas/smoobu";

type PriceDisplayProps = {
  checkIn: string | null;
  checkOut: string | null;
  smoobuPropertyId: number | null;
  currency: string | null;
  nightPriceCents: Record<string, number> | null;
  totalPriceCents: number | null;
  availabilityResult: SmoobuAvailabilityResponse | null;
  availabilityLoading: boolean;
  availabilityError: Error | null;
  additionalCosts: PropertyAdditionalCost[] | null;
  extras?: PropertyExtra[] | null;
  selectedExtras?: Set<number>;
  guests: number | null;
  cityTax?: CityTax | null;
  onRetry?: () => void;
};

export function PriceDisplay({ onRetry, ...props }: PriceDisplayProps) {
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
        <div className="space-y-3">
          <p className="text-sm text-red-400 font-medium">
            Something didn't work
          </p>
          <p className="text-xs text-muted-foreground">
            Please try again or contact the host.
          </p>
          <div className="flex gap-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-white/10 transition-colors"
              >
                Retry
              </button>
            )}
            <a
              href="#contact"
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-white/10 transition-colors"
            >
              Contact host
            </a>
          </div>
        </div>
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
        <div className="text-sm text-muted-foreground">
          Contact host for pricing
        </div>
      );

    case "available": {
      const hasAdditionalCosts = state.additionalCostItems.length > 0 || state.extraItems.length > 0;

      if (!hasAdditionalCosts) {
        return (
          <div className="space-y-3">
            <div
              data-testid="price-total"
              className="flex items-baseline gap-1"
            >
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
          </div>
        );
      }

      const accommodationItem = {
        label: `${formatPrice(state.perNightCents / 100, state.currency)}/night x ${state.nights} night${state.nights !== 1 ? "s" : ""}`,
        amountCents: state.totalPriceCents,
      };

      return (
        <div className="space-y-3">
          <PriceBreakdown
            items={[accommodationItem, ...state.additionalCostItems, ...state.extraItems]}
            total={{ label: "Total", amountCents: state.grandTotalCents }}
            currency={state.currency}
          />
        </div>
      );
    }
  }
}
