/**
 * Pricing Management Route
 * Manage dynamic pricing for a property
 */

import { rootRoute } from "@/modules/backoffice/routes/BackofficeRoot";
import { PricingCalendar } from "@/modules/backoffice/ui/PricingCalendar";
import {
  useCreatePricingRule,
  useDeletePricingRule,
} from "@/modules/shared/api/pricing-queries";
import { createRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface PricingPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  price: number;
  label?: string;
}

function PricingManagementPage() {
  const [periods, setPeriods] = useState<PricingPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: Get propertyId from route params
  const propertyId = "temp-id";

  // Use mutations instead of fetch
  const createPricingRule = useCreatePricingRule({
    onSuccess: (result) => {
      // The mutation already invalidates queries
    },
  });

  const deletePricingRule = useDeletePricingRule({
    onSuccess: () => {
      // The mutation already invalidates queries
    },
  });

  useEffect(() => {
    // TODO: Fetch existing pricing periods from API
    setLoading(false);
  }, []);

  const handleSavePeriod = async (
    period: Omit<PricingPeriod, "id">
  ): Promise<void> => {
    try {
      const result = await createPricingRule.mutateAsync({
        assetId: propertyId,
        name: period.label || "Custom Period",
        startDate: period.startDate.toISOString().split("T")[0],
        endDate: period.endDate.toISOString().split("T")[0],
        multiplier: Math.round((period.price / 100) * 100), // Convert to percentage multiplier
      });

      // Add to local state
      setPeriods([...periods, { ...period, id: result.id }]);
    } catch (error) {
      console.error("Error saving pricing period:", error);
      throw error;
    }
  };

  const handleDeletePeriod = async (id: string): Promise<void> => {
    try {
      await deletePricingRule.mutateAsync(id);

      // Remove from local state
      setPeriods(periods.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting pricing period:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Pricing Management</h1>

      <PricingCalendar
        assetId={propertyId}
        existingPeriods={periods}
        onSavePeriod={handleSavePeriod}
        onDeletePeriod={handleDeletePeriod}
      />
    </div>
  );
}

export const pricingManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/properties/$id/pricing",
  component: PricingManagementPage,
});
