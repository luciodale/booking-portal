/**
 * Pricing Management Route
 * Manage dynamic pricing for a property
 */

import type { PricingPeriod } from "@/modules/pricing/domain/types";
import {
  useCreatePricingRule,
  useDeletePricingRule,
  usePricingRules,
  useUpdatePricingRule,
} from "@/modules/pricing/hooks/queries";
import { useProperty } from "@/modules/property/hooks/queries";
import { rootRoute } from "@/modules/property/routes/BackofficeRoot";
import { showSuccess } from "@/modules/shared/notificationStore";
import { PricingCalendar } from "@/modules/ui/views/PricingCalendarView";
import { toDateString } from "@/modules/utils/dates";
import { createRoute, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";

function PricingManagementPage() {
  const { id: propertyId } = useParams({ from: "/properties/$id/pricing" });
  const [syncing, setSyncing] = useState<"airbnb" | "booking" | null>(null);

  // Fetch property for base price
  const { data: property, isLoading: propertyLoading } =
    useProperty(propertyId);

  // Fetch existing pricing rules
  const { data: pricingRules = [], isLoading: rulesLoading } =
    usePricingRules(propertyId);

  const isLoading = propertyLoading || rulesLoading;
  const basePrice = property?.basePrice ?? 0;

  // Convert API data to PricingPeriod format
  // The multiplier in DB represents percentage (100 = base price, 150 = +50%)
  const periods: PricingPeriod[] = useMemo(
    () =>
      pricingRules.map((rule) => ({
        id: rule.id,
        startDate: new Date(rule.startDate),
        endDate: new Date(rule.endDate),
        price: Math.round((basePrice * rule.multiplier) / 100),
        percentageAdjustment: rule.multiplier - 100, // Convert to adjustment (150 -> +50%)
        label: rule.name,
      })),
    [pricingRules, basePrice]
  );

  // Mutations
  const createPricingRule = useCreatePricingRule();
  const updatePricingRule = useUpdatePricingRule(propertyId);
  const deletePricingRule = useDeletePricingRule(propertyId);

  const handleSavePeriod = async (
    period: Omit<PricingPeriod, "id">
  ): Promise<void> => {
    // Convert price to multiplier: (price / basePrice) * 100
    // e.g., if basePrice=10000 and price=15000, multiplier=150 (which means +50%)
    const multiplier =
      basePrice > 0 ? Math.round((period.price / basePrice) * 100) : 100;

    await createPricingRule.mutateAsync({
      assetId: propertyId,
      name: period.label || "Custom Period",
      startDate: toDateString(period.startDate),
      endDate: toDateString(period.endDate),
      multiplier,
    });
  };

  const handleUpdatePeriod = async (
    id: string,
    period: Partial<Omit<PricingPeriod, "id">>
  ): Promise<void> => {
    const multiplier =
      period.price !== undefined && basePrice > 0
        ? Math.round((period.price / basePrice) * 100)
        : undefined;

    const updateData: {
      name?: string;
      multiplier?: number;
      startDate?: string;
      endDate?: string;
    } = {};

    if (period.label !== undefined) updateData.name = period.label;
    if (multiplier !== undefined) updateData.multiplier = multiplier;
    if (period.startDate)
      updateData.startDate = toDateString(period.startDate);
    if (period.endDate) updateData.endDate = toDateString(period.endDate);

    await updatePricingRule.mutateAsync({
      id,
      data: updateData,
    });
  };

  const handleDeletePeriod = async (id: string): Promise<void> => {
    await deletePricingRule.mutateAsync(id);
  };

  const handleSyncToChannel = async (channel: "airbnb" | "booking") => {
    setSyncing(channel);
    // Mock sync - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSyncing(null);
    showSuccess(
      `Prices synced to ${channel === "airbnb" ? "Airbnb" : "Booking.com"}! (mock)`
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-8">
        <div className="text-center text-error">Property not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Pricing: {property.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            Base price: €{Math.round(basePrice / 100)}/night • Set dynamic
            pricing periods and sync to booking channels
          </p>
        </div>

        {/* Sync Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSyncToChannel("airbnb")}
            disabled={syncing !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white font-medium transition-colors disabled:opacity-50"
          >
            {syncing === "airbnb" ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12.001 18.5c-1.5 0-2.5-.5-3-1.5-.5-1-1-2.5-1.5-4.5-.3-1-.5-2-.5-3 0-2 1-3.5 3-3.5 1.5 0 2.5.5 3 1.5.5 1 1 2.5 1.5 4.5.3 1 .5 2 .5 3 0 2-1 3.5-3 3.5zm0-10c-1 0-1.5.5-1.5 1.5 0 .5.1 1.2.3 2 .4 1.5.8 2.8 1.2 3.5.2.3.5.5 1 .5s.8-.2 1-.5c.4-.7.8-2 1.2-3.5.2-.8.3-1.5.3-2 0-1-.5-1.5-1.5-1.5h-1z" />
              </svg>
            )}
            Sync to Airbnb
          </button>
          <button
            type="button"
            onClick={() => handleSyncToChannel("booking")}
            disabled={syncing !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#003580] hover:bg-[#003580]/90 text-white font-medium transition-colors disabled:opacity-50"
          >
            {syncing === "booking" ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h3v3H8V8zm5 0h3v3h-3V8zm-5 5h3v3H8v-3zm5 0h3v3h-3v-3z" />
              </svg>
            )}
            Sync to Booking.com
          </button>
        </div>
      </div>

      <PricingCalendar
        basePrice={basePrice}
        existingPeriods={periods}
        onSavePeriod={handleSavePeriod}
        onUpdatePeriod={handleUpdatePeriod}
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
