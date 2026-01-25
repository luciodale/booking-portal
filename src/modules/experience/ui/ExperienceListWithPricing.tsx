import { ListPriceManager } from "@/modules/ui/islands/ListPriceManager";
import { useCallback } from "react";

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

type ExperienceListWithPricingProps = {
  experienceIds: string[];
};

// ============================================================================
// Component
// ============================================================================

/**
 * Wrapper component that manages pricing state for experience list pages.
 * Renders date picker and broadcasts price updates via custom events.
 */
export function ExperienceListWithPricing({
  experienceIds,
}: ExperienceListWithPricingProps) {
  const handlePricesUpdate = useCallback(
    (newPrices: Map<string, PriceData>) => {
      // Dispatch custom event with price data
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
        experienceIds={experienceIds}
        onPricesUpdate={handlePricesUpdate}
      />
    </div>
  );
}
