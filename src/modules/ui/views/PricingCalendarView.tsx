/**
 * Pricing Calendar Component
 * Multi-view calendar for setting dynamic pricing periods
 */

import { reconcilePricingPeriods } from "@/modules/pricing/domain/reconciliation";
import type { DateRange, PricingPeriod } from "@/modules/pricing/domain/types";
import { MonthView } from "@/modules/ui/calendar/MonthView";
import { WeekView } from "@/modules/ui/calendar/WeekView";
import { YearView } from "@/modules/ui/calendar/YearView";
import { cn } from "@/modules/utils/cn";
import { useState } from "react";

type ViewMode = "week" | "month" | "year";
type PriceMode = "absolute" | "percentage";

interface PricingCalendarProps {
  /** Base price in cents */
  basePrice: number;
  existingPeriods?: PricingPeriod[];
  onSavePeriod: (period: Omit<PricingPeriod, "id">) => Promise<void>;
  onUpdatePeriod: (
    id: string,
    period: Partial<Omit<PricingPeriod, "id">>
  ) => Promise<void>;
  onDeletePeriod: (id: string) => Promise<void>;
}

export function PricingCalendar({
  basePrice,
  existingPeriods = [],
  onSavePeriod,
  onUpdatePeriod,
  onDeletePeriod,
}: PricingCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [priceMode, setPriceMode] = useState<PriceMode>("percentage");
  const [priceValue, setPriceValue] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PricingPeriod | null>(
    null
  );

  /** Calculate final price from input based on mode */
  const calculateFinalPrice = (value: string, mode: PriceMode): number => {
    const numValue = Number(value);
    if (mode === "absolute") {
      return numValue;
    }
    // Percentage mode: basePrice * (1 + percentage/100)
    return Math.round(basePrice * (1 + numValue / 100));
  };

  /** Get percentage from a price relative to base price */
  const getPercentageFromPrice = (price: number): number => {
    return Math.round(((price - basePrice) / basePrice) * 100);
  };

  const handleSavePeriod = async () => {
    if (!selectedRange?.from || !selectedRange?.to || !priceValue) {
      alert("Please select a date range and enter a price");
      return;
    }

    try {
      setSaving(true);
      const finalPrice = calculateFinalPrice(priceValue, priceMode);

      const newPeriod = {
        startDate: selectedRange.from,
        endDate: selectedRange.to,
        price: finalPrice,
        percentageAdjustment:
          priceMode === "percentage" ? Number(priceValue) : undefined,
        label: label || undefined,
      };

      // Reconcile with existing periods to handle overlaps
      const { toAdd, toUpdate, toDelete } = reconcilePricingPeriods(
        newPeriod,
        existingPeriods
      );

      // Execute all changes
      // 1. Deletions
      for (const id of toDelete) {
        await onDeletePeriod(id);
      }

      // 2. Updates
      for (const period of toUpdate) {
        await onUpdatePeriod(period.id, {
          startDate: period.startDate,
          endDate: period.endDate,
          // Keep existing prices/labels unless we want to change them (usually just date adjustment here)
          price: period.price,
          percentageAdjustment: period.percentageAdjustment,
          label: period.label,
        });
      }

      // 3. Additions (New period + potential splits)
      for (const period of toAdd) {
        await onSavePeriod(period);
      }

      setSelectedRange(undefined);
      setPriceValue("");
      setLabel("");
    } catch (error) {
      console.error("Failed to save pricing period:", error);
      alert("Failed to save pricing period");
    } finally {
      setSaving(false);
    }
  };

  const handleEditPeriod = (period: PricingPeriod) => {
    setEditingPeriod(period);
    // Default to percentage mode showing the adjustment
    if (period.percentageAdjustment !== undefined) {
      setPriceMode("percentage");
      setPriceValue(String(period.percentageAdjustment));
    } else {
      // Calculate percentage from price
      setPriceMode("percentage");
      setPriceValue(String(getPercentageFromPrice(period.price)));
    }
    setLabel(period.label || "");
  };

  const handleUpdatePeriod = async () => {
    if (!editingPeriod || !priceValue) {
      alert("Please enter a price");
      return;
    }

    try {
      setSaving(true);
      const finalPrice = calculateFinalPrice(priceValue, priceMode);
      await onUpdatePeriod(editingPeriod.id, {
        price: finalPrice,
        percentageAdjustment:
          priceMode === "percentage" ? Number(priceValue) : undefined,
        label: label || undefined,
      });

      setEditingPeriod(null);
      setPriceValue("");
      setLabel("");
    } catch (error) {
      console.error("Failed to update pricing period:", error);
      alert("Failed to update pricing period");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPeriod(null);
    setPriceValue("");
    setLabel("");
  };

  /** Preview price based on current input */
  const previewPrice = priceValue
    ? calculateFinalPrice(priceValue, priceMode)
    : basePrice;

  const CalendarView = {
    week: WeekView,
    month: MonthView,
    year: YearView,
  }[viewMode];

  return (
    <div className="bg-card border border-border p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Dynamic Pricing Calendar
        </h3>
      </div>

      {/* View Mode Selector & Tools */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                viewMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {selectedRange?.from && (
          <button
            type="button"
            onClick={() => setSelectedRange(undefined)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear Selection
          </button>
        )}
      </div>

      {/* Calendar View */}
      <div className="mb-6">
        <CalendarView
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          existingPeriods={existingPeriods}
          basePrice={basePrice}
        />
      </div>

      {/* Price Input - New Period */}
      {selectedRange?.from && selectedRange?.to && !editingPeriod && (
        <div className="border-t border-border pt-4">
          {/* Price Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setPriceMode("percentage");
                setPriceValue("");
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                priceMode === "percentage"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              % Adjustment
            </button>
            <button
              type="button"
              onClick={() => {
                setPriceMode("absolute");
                setPriceValue("");
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                priceMode === "absolute"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Absolute Price
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="price-input"
                className="block text-sm font-medium text-foreground mb-1"
              >
                {priceMode === "percentage"
                  ? "Adjustment % (e.g. +20, -10)"
                  : "Price per night (cents)"}
              </label>
              <div className="relative">
                <input
                  id="price-input"
                  type="number"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  placeholder={
                    priceMode === "percentage" ? "0" : String(basePrice)
                  }
                  className="input"
                />
                {priceMode === "percentage" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                )}
              </div>
              {priceValue && (
                <div className="text-xs text-muted-foreground mt-1">
                  Final price: €{Math.round(previewPrice / 100)}/night
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="label-input"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Label (optional)
              </label>
              <input
                id="label-input"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Summer Season"
                className="input"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Base price: €{Math.round(basePrice / 100)}/night
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedRange.from.toLocaleDateString()} -{" "}
              {selectedRange.to.toLocaleDateString()}
            </div>

            <button
              type="button"
              onClick={handleSavePeriod}
              disabled={saving || !priceValue}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Period"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Period Form */}
      {editingPeriod && (
        <div className="border-t border-border pt-4 bg-accent/30 -mx-6 px-6 pb-4">
          <h4 className="font-medium text-foreground mb-3">
            Edit Pricing Period
          </h4>

          {/* Price Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setPriceMode("percentage");
                setPriceValue(
                  String(getPercentageFromPrice(editingPeriod.price))
                );
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                priceMode === "percentage"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              % Adjustment
            </button>
            <button
              type="button"
              onClick={() => {
                setPriceMode("absolute");
                setPriceValue(String(editingPeriod.price));
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                priceMode === "absolute"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Absolute Price
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="edit-price-input"
                className="block text-sm font-medium text-foreground mb-1"
              >
                {priceMode === "percentage"
                  ? "Adjustment % (e.g. +20, -10)"
                  : "Price per night (cents)"}
              </label>
              <div className="relative">
                <input
                  id="edit-price-input"
                  type="number"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  placeholder={
                    priceMode === "percentage" ? "0" : String(basePrice)
                  }
                  className="input"
                />
                {priceMode === "percentage" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                )}
              </div>
              {priceValue && (
                <div className="text-xs text-muted-foreground mt-1">
                  Final price: €{Math.round(previewPrice / 100)}/night
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-label-input"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Label (optional)
              </label>
              <input
                id="edit-label-input"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Summer Season"
                className="input"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Base price: €{Math.round(basePrice / 100)}/night
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {editingPeriod.startDate.toLocaleDateString()} -{" "}
              {editingPeriod.endDate.toLocaleDateString()}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePeriod}
                disabled={saving || !priceValue}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Period"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Periods */}
      {existingPeriods.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <h4 className="font-medium text-foreground mb-3">
            Existing Pricing Periods ({existingPeriods.length})
          </h4>
          <div className="space-y-2">
            {existingPeriods.map((period) => {
              const percentDiff = getPercentageFromPrice(period.price);
              const percentLabel =
                percentDiff >= 0 ? `+${percentDiff}%` : `${percentDiff}%`;

              return (
                <div
                  key={period.id}
                  className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${
                    editingPeriod?.id === period.id
                      ? "bg-primary/10 border-primary"
                      : "bg-secondary/50 border-border"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {period.label || "Pricing Period"}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          percentDiff >= 0
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {percentLabel}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {period.startDate.toLocaleDateString()} -{" "}
                      {period.endDate.toLocaleDateString()} • €
                      {Math.round(period.price / 100)}/night
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditPeriod(period)}
                      disabled={editingPeriod?.id === period.id}
                      className="text-primary hover:text-primary/80 text-sm transition-colors disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePeriod(period.id)}
                      className="text-error hover:text-error/80 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
