import { ListPriceManager } from "@/modules/ui/islands/ListPriceManager";
import { useCallback, useState } from "react";

// ============================================================================
// Types
// ============================================================================

type PriceData = {
  id: string;
  basePrice: number;
  computedPrice: number;
  currency: string;
  nights: number;
  appliedRules: string[];
};

type PropertyListWithPricingProps = {
  assetIds: string[];
};

// ============================================================================
// Component
// ============================================================================

/**
 * Wrapper component that manages pricing state for property list pages.
 * Renders date picker and broadcasts price updates via custom events.
 */
export function PropertyListWithPricing({
  assetIds,
}: PropertyListWithPricingProps) {
  const [prices] = useState<Map<string, PriceData>>(new Map());

  const handlePricesUpdate = useCallback(
    (newPrices: Map<string, PriceData>) => {
      // Dispatch custom event with price data
      // This allows Astro components to listen and update their display
      const event = new CustomEvent("pricesUpdated", {
        detail: { prices: Object.fromEntries(newPrices) },
      });
      window.dispatchEvent(event);
    },
    []
  );

  return (
    <div className="mb-6">
      <ListPriceManager
        assetIds={assetIds}
        onPricesUpdate={handlePricesUpdate}
      />
    </div>
  );
}
