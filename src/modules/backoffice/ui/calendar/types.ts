import type { DateRange } from "react-day-picker";

export interface PricingPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  /** Price in cents - either absolute or calculated from base price + percentage */
  price: number;
  /** Percentage adjustment from base price (-50 to +200, where 0 = base price) */
  percentageAdjustment?: number;
  label?: string;
}

/** Common props for all calendar view components */
export interface CalendarViewProps {
  selectedRange: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  existingPeriods: PricingPeriod[];
  /** Base price in cents for displaying on calendar */
  basePrice: number;
}

/** Re-export DateRange for convenience */
export type { DateRange };
