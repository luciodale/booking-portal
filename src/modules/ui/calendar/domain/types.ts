/**
 * Calendar Domain Types
 * Types for calendar views and range selection
 */

export type DateRange = {
  from?: Date;
  to?: Date;
};

export type PricingPeriod = {
  id: string;
  startDate: Date;
  endDate: Date;
  price: number;
  percentageAdjustment?: number;
  label?: string;
};

export type CalendarViewProps = {
  selectedRange?: DateRange;
  onRangeChange: (range: DateRange | undefined) => void;
  existingPeriods: PricingPeriod[];
  basePrice: number;
};

export type DayState = {
  isToday: boolean;
  isDisabled: boolean;
  isPriced: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
};
