import { useState } from "react";
import { NavButton } from "./NavButton";
import type { CalendarViewProps } from "./types";
import { getDayClassName, useRangeSelection } from "./useRangeSelection";
import {
  formatPriceShort,
  getEffectivePriceForDate,
  getMonthDays,
} from "./utils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthView({
  selectedRange,
  onRangeChange,
  existingPeriods,
  basePrice,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getDayState, buildNextRange } = useRangeSelection({
    selectedRange,
    existingPeriods,
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthDays = getMonthDays(year, month);

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleDayClick = (date: Date) => {
    onRangeChange(buildNextRange(date));
  };

  return (
    <div className="bg-secondary/30 rounded-xl p-5 border border-border">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <NavButton
          direction="prev"
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          label="Previous month"
        />
        <span className="text-lg font-semibold text-card-foreground">
          {monthName}
        </span>
        <NavButton
          direction="next"
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          label="Next month"
        />
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, cellIndex) => {
          const cellKey = `${year}-${month}-cell-${cellIndex}`;

          if (!day) {
            return <div key={cellKey} className="h-16" />;
          }

          const state = getDayState(day);
          const baseClass = getDayClassName(state);
          const dayPrice = getEffectivePriceForDate(
            day,
            existingPeriods,
            basePrice
          );
          const isCustomPrice = state.isPriced;

          return (
            <button
              key={cellKey}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`relative h-16 flex flex-col items-center justify-start pt-1.5 rounded-lg text-sm font-medium ${baseClass}`}
            >
              <span>{day.getDate()}</span>
              <span
                className={`text-[10px] mt-0.5 ${
                  isCustomPrice
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
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
        <button
          type="button"
          onClick={() => setCurrentDate(new Date())}
          className="text-sm text-primary hover:text-primary-hover transition-colors"
        >
          Go to today
        </button>
      </div>
    </div>
  );
}
