/**
 * SmoobuCalendarFetcher - React island for property pages
 * Fetches and displays live pricing and availability from Smoobu
 * NOTE: This is a client-side component that should be used as an Astro island
 */

import { useState } from "react";
import { useSmoobuRates } from "../hooks/useSmoobuRates";

// ============================================================================
// Types
// ============================================================================

interface SmoobuCalendarFetcherProps {
  smoobuPropertyId: number;
  initialStartDate?: string; // YYYY-MM-DD
  initialEndDate?: string; // YYYY-MM-DD
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatPrice(price: number | null, currency: string = "EUR"): string {
  if (price === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(price);
}

// ============================================================================
// Component
// ============================================================================

export function SmoobuCalendarFetcher({
  smoobuPropertyId,
  initialStartDate,
  initialEndDate,
}: SmoobuCalendarFetcherProps) {
  const today = new Date();
  const [startDate, setStartDate] = useState(
    initialStartDate || formatDate(today)
  );
  const [endDate, setEndDate] = useState(
    initialEndDate || formatDate(addDays(today, 30))
  );

  const { data, isLoading, error } = useSmoobuRates({
    apartmentIds: [smoobuPropertyId],
    startDate,
    endDate,
  });

  const propertyData = data?.data?.[smoobuPropertyId.toString()];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Live Pricing & Availability
      </h3>

      {/* Date Range Selector */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <label
            htmlFor="start-date"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="end-date"
            className="block text-sm font-medium text-foreground mb-1"
          >
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-3 py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-[1.5px] border-zinc-800/20 border-t-zinc-900" />
          <p className="text-sm text-muted-foreground">
            Loading rates from Smoobu...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <p className="text-sm text-error">
            {error.message || "Failed to load pricing data"}
          </p>
        </div>
      )}

      {/* Calendar Display */}
      {propertyData && !isLoading && (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">
              Showing rates from Smoobu for property ID: {smoobuPropertyId}
            </p>
            <p className="text-xs text-muted-foreground">
              Total days: {Object.keys(propertyData).length}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b border-border">
                <tr>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">
                    Min Nights
                  </th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">
                    Available
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(propertyData).map(([date, dayData]) => (
                  <tr
                    key={date}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-2 px-3 text-foreground">{date}</td>
                    <td className="py-2 px-3 text-right text-foreground">
                      {formatPrice(dayData.price)}
                    </td>
                    <td className="py-2 px-3 text-center text-muted-foreground">
                      {dayData.min_length_of_stay || "-"}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {dayData.available === 1 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10">
                          <span className="text-green-500 text-xs">✓</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error/10">
                          <span className="text-error text-xs">✗</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            <p>
              <strong>Note:</strong> Pricing and availability are fetched in
              real-time from Smoobu. Rate limiting applies - consider caching
              for production.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
