import type { CalendarViewProps } from "@/modules/pricing/domain/types";
import {
  formatPriceShort,
  getEffectivePriceForDate,
  getWeekDays,
} from "@/modules/pricing/utils/calendar-utils";
import { cn } from "@/modules/utils/cn";
import { useState } from "react";
import { NavButton } from "./NavButton";
import { getDayClassName, useRangeSelection } from "./useRangeSelection";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeekView({
  selectedRange,
  onRangeChange,
  existingPeriods,
  basePrice,
}: CalendarViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const { getDayState, buildNextRange } = useRangeSelection({
    selectedRange,
    existingPeriods,
  });

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(baseDate);

  const formatWeekRange = () => {
    const first = weekDays[0];
    const last = weekDays[6];
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${first.toLocaleDateString("en-US", opts)} – ${last.toLocaleDateString("en-US", opts)}, ${first.getFullYear()}`;
  };

  const handleDayClick = (date: Date) => {
    onRangeChange(buildNextRange(date));
  };

  return (
    <div className="bg-secondary/30 rounded-xl p-5 border border-border">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <NavButton
          direction="prev"
          onClick={() => setWeekOffset((o) => o - 1)}
          label="Previous week"
        />
        <span className="text-lg font-semibold text-card-foreground">
          {formatWeekRange()}
        </span>
        <NavButton
          direction="next"
          onClick={() => setWeekOffset((o) => o + 1)}
          label="Next week"
        />
      </div>

      {/* Week Days Strip */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const state = getDayState(day);
          const baseClass = getDayClassName(state);
          const dayPrice = getEffectivePriceForDate(
            day,
            existingPeriods,
            basePrice
          );
          const isCustomPrice = state.isPriced;
          const isSelected = state.isRangeStart || state.isRangeEnd;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative flex flex-col items-center p-4 rounded-xl",
                baseClass
              )}
            >
              <span className="text-xs font-medium opacity-70 mb-1">
                {DAY_NAMES[i]}
              </span>
              <span className="text-2xl font-bold">{day.getDate()}</span>
              <span
                className={cn(
                  "text-xs mt-1",
                  isSelected
                    ? "text-primary-foreground"
                    : isCustomPrice
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                )}
              >
                {formatPriceShort(dayPrice)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend & Today button */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            Base: {formatPriceShort(basePrice)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Custom price
          </span>
        </div>
        {weekOffset !== 0 && (
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            Back to current week
          </button>
        )}
      </div>
    </div>
  );
}
