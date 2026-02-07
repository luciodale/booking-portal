/**
 * Date Range Picker Component
 * Custom calendar for selecting check-in and check-out dates.
 * Supports both controlled mode (with props) and uncontrolled mode (using store).
 */

import {
  bookingStore,
  setDateRange as setStoreRange,
} from "@/modules/booking/store/bookingStore";
import {
  getMonthDays,
  isSameDay,
} from "@/modules/ui/calendar/utils/calendar-utils";
import { cn } from "@/modules/utils/cn";
import { useStore } from "@nanostores/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

/**
 * Compute next range from a day click
 */
function buildRangeFromClick(
  date: Date,
  currentRange?: DateRange
): DateRange | undefined {
  if (!currentRange?.from) {
    return { from: date };
  }
  if (!currentRange.to) {
    const from = currentRange.from;
    if (date < from) {
      return { from: date, to: from };
    }
    return { from, to: date };
  }
  return { from: date };
}

type DateRangePickerProps = {
  selectedRange?: DateRange;
  onRangeChange?: (range: DateRange | undefined) => void;
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DateRangePicker({
  selectedRange: controlledRange,
  onRangeChange,
}: DateRangePickerProps = {}) {
  const $booking = useStore(bookingStore);
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Controlled mode: use props; Uncontrolled mode: use store
  const isControlled =
    controlledRange !== undefined || onRangeChange !== undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthDays = getMonthDays(year, month);

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Use controlled range if provided, otherwise derive from store
  const selectedRange: DateRange | undefined = isControlled
    ? controlledRange
    : $booking.startDate && $booking.endDate
      ? { from: $booking.startDate, to: $booking.endDate }
      : $booking.startDate
        ? { from: $booking.startDate, to: undefined }
        : undefined;

  const setDateRange = (from: Date | undefined, to: Date | undefined) => {
    if (isControlled && onRangeChange) {
      onRangeChange(from ? { from, to } : undefined);
    } else {
      setStoreRange(from, to);
    }
  };

  const handleDayClick = (date: Date) => {
    const newRange = buildRangeFromClick(date, selectedRange);
    setDateRange(newRange?.from, newRange?.to);

    // Close picker when a complete range is selected
    if (newRange?.from && newRange?.to) {
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  const isPastDate = (date: Date): boolean => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate < today;
  };

  const getDayState = (date: Date) => {
    const isRangeStart =
      !!selectedRange?.from && isSameDay(date, selectedRange.from);
    const isRangeEnd = !!selectedRange?.to && isSameDay(date, selectedRange.to);

    const isInRange = (() => {
      if (!selectedRange?.from) return false;
      if (!selectedRange.to) return isRangeStart;
      return date >= selectedRange.from && date <= selectedRange.to;
    })();

    return {
      isRangeStart,
      isRangeEnd,
      isRangeMiddle: isInRange && !isRangeStart && !isRangeEnd,
      isToday: isSameDay(date, today),
      isPast: isPastDate(date),
    };
  };

  const formatDate = (date: Date | undefined | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const displayStartDate = selectedRange?.from;
  const displayEndDate = selectedRange?.to;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="relative">
      {/* Date Input Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="check-in-btn"
            className="block text-sm text-muted-foreground mb-2.5 font-medium"
          >
            Check-in
          </label>
          <button
            id="check-in-btn"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-3.5 bg-secondary rounded-xl text-left text-foreground hover:bg-card-hover transition-colors border border-border/50"
          >
            {formatDate(displayStartDate)}
          </button>
        </div>
        <div>
          <label
            htmlFor="check-out-btn"
            className="block text-sm text-muted-foreground mb-2.5 font-medium"
          >
            Check-out
          </label>
          <button
            id="check-out-btn"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-3.5 bg-secondary rounded-xl text-left text-foreground hover:bg-card-hover transition-colors border border-border/50"
          >
            {formatDate(displayEndDate)}
          </button>
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Close calendar"
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter") setIsOpen(false);
            }}
          />

          {/* Calendar */}
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card rounded-xl border border-border shadow-xl p-4 animate-fade-in">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-lg bg-secondary hover:bg-card-hover transition-colors border border-border"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5 text-card-foreground" />
              </button>
              <span className="text-lg font-semibold text-card-foreground">
                {monthName}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-lg bg-secondary hover:bg-card-hover transition-colors border border-border"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5 text-card-foreground" />
              </button>
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
                  return <div key={cellKey} className="h-10" />;
                }

                const state = getDayState(day);
                const isDisabled = state.isPast;

                return (
                  <button
                    key={cellKey}
                    type="button"
                    onClick={() => !isDisabled && handleDayClick(day)}
                    disabled={isDisabled}
                    className={cn(
                      "h-10 w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150",
                      state.isRangeStart || state.isRangeEnd
                        ? "bg-primary text-primary-foreground shadow-md"
                        : state.isRangeMiddle
                          ? "bg-primary/15 text-card-foreground"
                          : state.isToday
                            ? "ring-2 ring-primary ring-inset text-card-foreground hover:bg-card-hover"
                            : isDisabled
                              ? "opacity-30 cursor-not-allowed text-muted-foreground"
                              : "text-card-foreground hover:bg-card-hover"
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <button
                type="button"
                onClick={() => setDateRange(undefined, undefined)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear dates
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
