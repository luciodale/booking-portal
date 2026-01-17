import { useStore } from "@nanostores/react";
import {
  bookingStore,
  priceBreakdown,
  totalNights,
} from "../store/bookingStore";

/**
 * Price breakdown island that reacts to booking state changes.
 * Shows dynamic pricing as dates and guests are selected.
 * Displays applied pricing rules when special rates apply.
 */
export default function PriceBreakdown() {
  const $booking = useStore(bookingStore);
  const $nights = useStore(totalNights);
  const $breakdown = useStore(priceBreakdown);

  // Format currency (values are in cents)
  const formatPrice = (amountCents: number) => {
    const currency = $booking.context?.currency?.toUpperCase() ?? "EUR";
    return `${currency} ${(amountCents / 100).toLocaleString()}`;
  };

  // Get base price per night for display
  const basePerNight = $booking.context?.basePrice ?? 0;

  // If no dates selected, show placeholder
  if ($nights === 0 || !$breakdown) {
    return (
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          Select dates to see price breakdown
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-border space-y-4 animate-fade-in">
      {/* Accommodation */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {formatPrice(basePerNight)} × {$nights} night
          {$nights !== 1 ? "s" : ""}
        </span>
        <span className="text-foreground font-medium">
          {formatPrice($breakdown.baseTotal)}
        </span>
      </div>

      {/* Applied Pricing Rules */}
      {$breakdown.appliedRules.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-500">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            role="img"
            aria-label="Special pricing indicator"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Includes: {$breakdown.appliedRules.join(", ")}</span>
        </div>
      )}

      {/* Cleaning Fee */}
      {$breakdown.cleaningFee > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Cleaning fee</span>
          <span className="text-foreground font-medium">
            {formatPrice($breakdown.cleaningFee)}
          </span>
        </div>
      )}

      {/* Service Fee */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Service fee</span>
        <span className="text-foreground font-medium">
          {formatPrice($breakdown.serviceFee)}
        </span>
      </div>

      {/* Total */}
      <div className="flex justify-between pt-4 border-t border-border font-semibold text-base">
        <span className="text-foreground">Total</span>
        <span className="text-foreground">{formatPrice($breakdown.total)}</span>
      </div>
    </div>
  );
}
