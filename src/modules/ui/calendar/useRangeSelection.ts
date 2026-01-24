import { computeNextRange } from "@/modules/pricing/domain/rangeSelection";
import type { DateRange, PricingPeriod } from "@/modules/pricing/domain/types";
import {
  isInPricingPeriod,
  isSameDay,
} from "@/modules/pricing/utils/calendar-utils";
import { cn } from "@/modules/utils/cn";

interface DayState {
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isRangeMiddle: boolean;
  isToday: boolean;
  isPriced: boolean;
}

interface UseRangeSelectionParams {
  selectedRange: DateRange | undefined;
  existingPeriods: PricingPeriod[];
}

/** Hook to compute day states and handle range building */
export function useRangeSelection({
  selectedRange,
  existingPeriods,
}: UseRangeSelectionParams) {
  const today = new Date();

  const getDayState = (date: Date): DayState => {
    const isRangeStart =
      !!selectedRange?.from && isSameDay(date, selectedRange.from);
    const isRangeEnd = !!selectedRange?.to && isSameDay(date, selectedRange.to);

    const isInRange = (() => {
      if (!selectedRange?.from) return false;
      if (!selectedRange.to) return isRangeStart;
      return date >= selectedRange.from && date <= selectedRange.to;
    })();

    return {
      isSelected: isInRange,
      isRangeStart,
      isRangeEnd,
      isRangeMiddle: isInRange && !isRangeStart && !isRangeEnd,
      isToday: isSameDay(date, today),
      isPriced: isInPricingPeriod(date, existingPeriods),
    };
  };

  const buildNextRange = (clickedDate: Date): DateRange | undefined => {
    return computeNextRange(clickedDate, selectedRange);
  };

  return { getDayState, buildNextRange };
}

/** CSS class builder for day buttons */
export function getDayClassName(state: DayState): string {
  const base = "transition-all duration-150";

  if (state.isRangeStart || state.isRangeEnd) {
    return cn(base, "bg-primary text-primary-foreground shadow-md");
  }

  if (state.isRangeMiddle) {
    return cn(base, "bg-primary/15 text-card-foreground");
  }

  // isPriced background removed - only show price text, no background highlight
  return cn(
    base,
    "hover:bg-card-hover text-card-foreground",
    state.isToday && "ring-2 ring-primary ring-inset"
  );
}
