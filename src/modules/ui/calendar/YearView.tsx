import { cn } from "@/modules/utils/cn";
import { useState } from "react";
import { NavButton } from "./NavButton";
import type { CalendarViewProps, PricingPeriod } from "./domain/types";
import { useRangeSelection } from "./useRangeSelection";
import {
  formatPriceShort,
  getEffectivePriceForDate,
  getMonthDays,
  isInPricingPeriod,
} from "./utils/calendar-utils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_INITIALS = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
] as const;

interface MiniMonthProps {
  year: number;
  month: number;
  onDayClick: (date: Date) => void;
  getDayState: ReturnType<typeof useRangeSelection>["getDayState"];
  existingPeriods: PricingPeriod[];
  basePrice: number;
}

function MiniMonth({
  year,
  month,
  onDayClick,
  getDayState,
  existingPeriods,
  basePrice,
}: MiniMonthProps) {
  const days = getMonthDays(year, month);

  return (
    <div className="bg-secondary rounded-xl p-3 border border-border/50">
      {/* Month Header */}
      <div className="text-sm font-semibold text-card-foreground mb-2 text-center">
        {MONTH_NAMES[month]}
      </div>

      {/* Day Initials */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {DAY_INITIALS.map((day) => (
          <div
            key={day.key}
            className="text-[10px] text-muted-foreground text-center py-0.5"
          >
            {day.label}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-px">
        {days.map((day, cellIndex) => {
          const cellKey = `${year}-${month}-cell-${cellIndex}`;

          if (!day) {
            return <div key={cellKey} className="aspect-square" />;
          }

          const state = getDayState(day);
          const isEndpoint = state.isRangeStart || state.isRangeEnd;
          const hasCustomPrice = isInPricingPeriod(day, existingPeriods);
          const dayPrice = getEffectivePriceForDate(
            day,
            existingPeriods,
            basePrice
          );

          return (
            <button
              key={cellKey}
              type="button"
              onClick={() => onDayClick(day)}
              title={formatPriceShort(dayPrice)}
              className={cn(
                "aspect-square flex items-center justify-center text-[11px] font-medium rounded transition-all duration-100 relative group",
                isEndpoint && "bg-primary text-primary-foreground",
                !isEndpoint &&
                  state.isRangeMiddle &&
                  "bg-primary/20 text-card-foreground",
                !isEndpoint &&
                  !state.isRangeMiddle &&
                  state.isToday &&
                  "ring-1 ring-primary text-card-foreground",
                !isEndpoint &&
                  !state.isRangeMiddle &&
                  !state.isToday &&
                  "text-card-foreground hover:bg-card-hover"
              )}
            >
              {day.getDate()}
              {/* Custom price indicator dot */}
              {hasCustomPrice && !isEndpoint && !state.isRangeMiddle && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function YearView({
  selectedRange,
  onRangeChange,
  existingPeriods,
  basePrice,
}: CalendarViewProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const { getDayState, buildNextRange } = useRangeSelection({
    selectedRange,
    existingPeriods,
  });

  const handleDayClick = (date: Date) => {
    onRangeChange(buildNextRange(date));
  };

  return (
    <div className="bg-secondary/30 rounded-xl p-5 border border-border">
      {/* Year Navigation */}
      <div className="flex items-center justify-between mb-6">
        <NavButton
          direction="prev"
          onClick={() => setYear((y) => y - 1)}
          label="Previous year"
        />
        <span className="text-xl font-bold text-card-foreground">{year}</span>
        <NavButton
          direction="next"
          onClick={() => setYear((y) => y + 1)}
          label="Next year"
        />
      </div>

      {/* 12 Month Grid */}
      <div className="grid grid-cols-4 gap-3 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        {Array.from({ length: 12 }, (_, month) => (
          <MiniMonth
            key={MONTH_NAMES[month]}
            year={year}
            month={month}
            onDayClick={handleDayClick}
            getDayState={getDayState}
            existingPeriods={existingPeriods}
            basePrice={basePrice}
          />
        ))}
      </div>

      {/* Legend & Current year button */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            Base: {formatPriceShort(basePrice)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Custom price (hover to see)
          </span>
        </div>
        {year !== new Date().getFullYear() && (
          <button
            type="button"
            onClick={() => setYear(new Date().getFullYear())}
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            Back to {new Date().getFullYear()}
          </button>
        )}
      </div>
    </div>
  );
}
