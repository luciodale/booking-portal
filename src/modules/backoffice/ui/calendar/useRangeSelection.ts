import type { DateRange, PricingPeriod } from "./types";
import { computeNextRange } from "./rangeSelection";
import { isSameDay, isInPricingPeriod } from "./utils";

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
    const isRangeStart = !!selectedRange?.from && isSameDay(date, selectedRange.from);
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
    return `${base} bg-primary text-primary-foreground shadow-md`;
  }

  if (state.isRangeMiddle) {
    return `${base} bg-primary/15 text-card-foreground`;
  }

  let classes = `${base} hover:bg-card-hover text-card-foreground`;

  if (state.isToday) {
    classes += " ring-2 ring-primary ring-inset";
  }

  if (state.isPriced) {
    classes += " bg-primary/10";
  }

  return classes;
}
