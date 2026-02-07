import {
  type DateRange,
  DateRangePicker,
} from "@/modules/booking/ui/DateRangePicker";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

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

type PriceApiResponse = {
  success: boolean;
  data?: { prices: PriceData[] };
  error?: { message: string };
};

type ListPriceManagerProps = {
  assetIds?: string[];
  experienceIds?: string[];
  onPricesUpdate: (prices: Map<string, PriceData>) => void;
};

// ============================================================================
// Component
// ============================================================================

export function ListPriceManager({
  assetIds = [],
  experienceIds = [],
  onPricesUpdate,
}: ListPriceManagerProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch prices when dates change
  useEffect(() => {
    const fetchPrices = async () => {
      if (!dateRange?.from) {
        // Clear prices when no dates selected
        onPricesUpdate(new Map());
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("startDate", dateRange.from.toISOString().split("T")[0]);
        if (dateRange.to) {
          params.set("endDate", dateRange.to.toISOString().split("T")[0]);
        }
        if (assetIds.length > 0) {
          params.set("assetIds", assetIds.join(","));
        }
        if (experienceIds.length > 0) {
          params.set("experienceIds", experienceIds.join(","));
        }

        const response = await fetch(`/api/prices?${params.toString()}`);
        const data: PriceApiResponse = await response.json();

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || "Failed to fetch prices");
        }

        // Convert array to map for easy lookup
        const priceMap = new Map<string, PriceData>();
        for (const price of data.data.prices) {
          priceMap.set(price.id, price);
        }

        onPricesUpdate(priceMap);
      } catch (err) {
        console.error("Error fetching prices:", err);
        setError(err instanceof Error ? err.message : "Failed to load prices");
        onPricesUpdate(new Map());
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, [dateRange, assetIds, experienceIds, onPricesUpdate]);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>Select dates to see pricing:</span>
      </div>
      <div className="flex-1 max-w-md">
        <DateRangePicker
          selectedRange={dateRange}
          onRangeChange={setDateRange}
        />
      </div>
      {isLoading && (
        <span className="text-sm text-muted-foreground">Loading prices...</span>
      )}
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
