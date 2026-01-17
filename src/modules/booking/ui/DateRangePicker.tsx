import { useStore } from "@nanostores/react";
import { useState } from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { bookingStore, setDateRange } from "../store/bookingStore";

/**
 * Date range picker island for selecting check-in and check-out dates.
 * Uses react-day-picker and syncs with the global booking store.
 */
export default function DateRangePicker() {
  const $booking = useStore(bookingStore);
  const [isOpen, setIsOpen] = useState(false);

  const selected: DateRange | undefined =
    $booking.startDate && $booking.endDate
      ? { from: $booking.startDate, to: $booking.endDate }
      : $booking.startDate
        ? { from: $booking.startDate, to: undefined }
        : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range?.from, range?.to);
    // Close picker when a complete range is selected
    if (range?.from && range?.to) {
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

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
            {formatDate($booking.startDate)}
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
            {formatDate($booking.endDate)}
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
            <DayPicker
              mode="range"
              selected={selected}
              onSelect={handleSelect}
              numberOfMonths={1}
              disabled={{ before: new Date() }}
              min={1}
              classNames={{
                root: "rdp-custom",
                day: "rdp-day-custom",
                selected: "rdp-selected-custom",
                today: "rdp-today-custom",
              }}
              styles={{
                month_caption: {
                  color: "var(--color-foreground)",
                  fontWeight: 600,
                  padding: "0.5rem 0",
                },
                weekday: {
                  color: "var(--color-muted-foreground)",
                  fontSize: "0.75rem",
                },
                day: { color: "var(--color-foreground)" },
                day_button: {
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  transition: "all 0.15s ease",
                },
                chevron: { fill: "var(--color-primary)" },
              }}
              modifiersStyles={{
                selected: {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-primary-foreground)",
                },
                range_middle: {
                  backgroundColor:
                    "color-mix(in oklch, var(--color-primary) 20%, transparent)",
                  color: "var(--color-foreground)",
                },
                today: {
                  border: "2px solid var(--color-primary)",
                },
                disabled: {
                  opacity: 0.3,
                },
              }}
            />

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
