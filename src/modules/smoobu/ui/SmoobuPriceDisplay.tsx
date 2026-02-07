/**
 * SmoobuPriceDisplay - Shows live Smoobu pricing for a property
 * Lightweight component for property cards
 */

import { useSmoobuRates } from "../hooks/useSmoobuRates";

// ============================================================================
// Types
// ============================================================================

interface SmoobuPriceDisplayProps {
  smoobuPropertyId: number;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateTotalPrice(
  propertyData: Record<
    string,
    { price: number | null; available: 0 | 1 }
  > | undefined
): { total: number; nights: number; available: boolean } | null {
  if (!propertyData) return null;

  let total = 0;
  let nights = 0;
  let allAvailable = true;

  for (const [_date, dayData] of Object.entries(propertyData)) {
    if (dayData.price === null || dayData.available === 0) {
      allAvailable = false;
      break;
    }
    total += dayData.price;
    nights++;
  }

  if (!allAvailable) return null;

  return { total, nights, available: true };
}

function formatPrice(price: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ============================================================================
// Component
// ============================================================================

export function SmoobuPriceDisplay({
  smoobuPropertyId,
  checkIn,
  checkOut,
  className = "",
}: SmoobuPriceDisplayProps) {
  const { data, isLoading, error } = useSmoobuRates({
    apartmentIds: [smoobuPropertyId],
    startDate: checkIn,
    endDate: checkOut,
  });

  const propertyData = data?.data?.[smoobuPropertyId.toString()];
  const priceInfo = calculateTotalPrice(propertyData);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-zinc-800/20 border-t-zinc-900" />
        <span className="text-sm text-muted-foreground">Loading price...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <span className="text-sm text-error">Price unavailable</span>
      </div>
    );
  }

  if (!priceInfo || !priceInfo.available) {
    return (
      <div className={className}>
        <span className="text-sm text-muted-foreground">Not available</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">
          {formatPrice(priceInfo.total)}
        </span>
        <span className="text-sm text-muted-foreground">
          for {priceInfo.nights} {priceInfo.nights === 1 ? "night" : "nights"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {formatPrice(priceInfo.total / priceInfo.nights)} per night
      </p>
    </div>
  );
}

