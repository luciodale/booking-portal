import { useState } from "react";
import { NavButton } from "./NavButton";
import type { CalendarViewProps } from "./types";
import { useRangeSelection, getDayClassName } from "./useRangeSelection";
import { getMonthDays } from "./utils";

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const DAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"];

interface MiniMonthProps {
  year: number;
  month: number;
  onDayClick: (date: Date) => void;
  getDayState: ReturnType<typeof useRangeSelection>["getDayState"];
}

function MiniMonth({ year, month, onDayClick, getDayState }: MiniMonthProps) {
  const days = getMonthDays(year, month);

  return (
    <div className="bg-secondary rounded-xl p-3 border border-border/50">
      {/* Month Header */}
      <div className="text-sm font-semibold text-card-foreground mb-2 text-center">
        {MONTH_NAMES[month]}
      </div>

      {/* Day Initials */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {DAY_INITIALS.map((initial, i) => (
          <div
            key={`${initial}-${i}`}
            className="text-[10px] text-muted-foreground text-center py-0.5"
          >
            {initial}
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

          return (
            <button
              key={cellKey}
              type="button"
              onClick={() => onDayClick(day)}
              className={`
                aspect-square flex items-center justify-center text-[11px] font-medium
                rounded transition-all duration-100
                ${isEndpoint
                  ? "bg-primary text-primary-foreground"
                  : state.isRangeMiddle
                    ? "bg-primary/20 text-card-foreground"
                    : state.isToday
                      ? "ring-1 ring-primary text-card-foreground"
                      : state.isPriced
                        ? "bg-primary/10 text-card-foreground"
                        : "text-card-foreground hover:bg-card-hover"
                }
              `}
            >
              {day.getDate()}
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
  basePrice: _basePrice,
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
            key={month}
            year={year}
            month={month}
            onDayClick={handleDayClick}
            getDayState={getDayState}
          />
        ))}
      </div>

      {/* Current year button */}
      {year !== new Date().getFullYear() && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setYear(new Date().getFullYear())}
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            Back to {new Date().getFullYear()}
          </button>
        </div>
      )}
    </div>
  );
}
