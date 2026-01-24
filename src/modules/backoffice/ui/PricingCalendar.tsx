/**
 * Pricing Calendar Component
 * Multi-view calendar for setting dynamic pricing periods
 */

import { useState } from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type ViewMode = "week" | "month" | "year";

interface PricingPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  price: number;
  label?: string;
}

interface PricingCalendarProps {
  assetId: string;
  existingPeriods?: PricingPeriod[];
  onSavePeriod: (period: Omit<PricingPeriod, "id">) => Promise<void>;
  onDeletePeriod: (id: string) => Promise<void>;
}

export function PricingCalendar({
  assetId,
  existingPeriods = [],
  onSavePeriod,
  onDeletePeriod,
}: PricingCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [price, setPrice] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSavePeriod = async () => {
    if (!selectedRange?.from || !selectedRange?.to || !price) {
      alert("Please select a date range and enter a price");
      return;
    }

    try {
      setSaving(true);
      await onSavePeriod({
        startDate: selectedRange.from,
        endDate: selectedRange.to,
        price: Number(price),
        label: label || undefined,
      });

      // Reset form
      setSelectedRange(undefined);
      setPrice("");
      setLabel("");
    } catch (error) {
      console.error("Failed to save pricing period:", error);
      alert("Failed to save pricing period");
    } finally {
      setSaving(false);
    }
  };

  const getModifiers = () => {
    const modifiers: Record<string, Date[]> = {};

    existingPeriods.forEach((period, index) => {
      const dates: Date[] = [];
      const current = new Date(period.startDate);
      const end = new Date(period.endDate);

      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      modifiers[`period-${index}`] = dates;
    });

    return modifiers;
  };

  const getModifiersStyles = () => {
    const styles: Record<string, React.CSSProperties> = {};

    existingPeriods.forEach((_, index) => {
      styles[`period-${index}`] = {
        backgroundColor: "oklch(0.75 0.12 85 / 0.2)",
        color: "oklch(0.75 0.12 85)",
        fontWeight: "bold",
      };
    });

    return styles;
  };

  const numberOfMonths =
    viewMode === "week" ? 1 : viewMode === "month" ? 1 : 12;

  return (
    <div className="bg-card border border-border p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Dynamic Pricing Calendar</h3>

        {/* View Mode Selector */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "week"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setViewMode("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "month"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setViewMode("year")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "year"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="mb-6 pricing-calendar-dark">
        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={setSelectedRange}
          numberOfMonths={numberOfMonths}
          modifiers={getModifiers()}
          modifiersStyles={getModifiersStyles()}
          className="border border-border rounded-xl p-4 bg-secondary/30"
        />
      </div>

      {/* Price Input */}
      {selectedRange?.from && selectedRange?.to && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="price-input"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Price per night (cents)
              </label>
              <input
                id="price-input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="250000"
                className="input"
                min="0"
              />
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
              disabled={saving || !price}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Period"}
            </button>
          </div>
        </div>
      )}

      {/* Existing Periods */}
      {existingPeriods.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <h4 className="font-medium text-foreground mb-3">Existing Pricing Periods</h4>
          <div className="space-y-2">
            {existingPeriods.map((period) => (
              <div
                key={period.id}
                className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg border border-border"
              >
                <div>
                  <div className="font-medium text-foreground">
                    {period.label || "Pricing Period"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {period.startDate.toLocaleDateString()} -{" "}
                    {period.endDate.toLocaleDateString()} • €
                    {(period.price / 100).toFixed(0)}/night
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDeletePeriod(period.id)}
                  className="text-error hover:text-error/80 text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
