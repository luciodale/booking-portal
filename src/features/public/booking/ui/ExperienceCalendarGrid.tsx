import type { ExperienceAvailabilityMap } from "@/features/public/booking/api/fetchExperienceAvailability";
import {
  addMonths,
  formatDate,
  formatMonthYear,
  getMonthDays,
  getStartPadding,
  todayStr,
} from "@/features/public/booking/domain/dateUtils";
import { cn } from "@/modules/utils/cn";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type ExperienceCalendarGridProps = {
  currentMonth: Date;
  selectedDate: string | null;
  availabilityMap: ExperienceAvailabilityMap;
  maxParticipants: number;
  onDateClick: (dateStr: string) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  vertical?: boolean;
  monthCount?: number;
};

export function ExperienceCalendarGrid({
  currentMonth,
  selectedDate,
  availabilityMap,
  maxParticipants,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  vertical,
  monthCount = 2,
}: ExperienceCalendarGridProps) {
  const months = Array.from({ length: monthCount }, (_, i) =>
    addMonths(currentMonth, i)
  );
  const showNavigation = onPrevMonth != null && onNextMonth != null;

  return (
    <div className="space-y-4">
      {showNavigation && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onPrevMonth}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight />
          </button>
        </div>
      )}

      <div className={cn(vertical ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-6")}>
        {months.map((month) => (
          <MonthGrid
            key={formatDate(month)}
            month={month}
            selectedDate={selectedDate}
            availabilityMap={availabilityMap}
            maxParticipants={maxParticipants}
            onDateClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
}

function MonthGrid({
  month,
  selectedDate,
  availabilityMap,
  maxParticipants,
  onDateClick,
}: {
  month: Date;
  selectedDate: string | null;
  availabilityMap: ExperienceAvailabilityMap;
  maxParticipants: number;
  onDateClick: (dateStr: string) => void;
}) {
  const days = getMonthDays(month);
  const padding = getStartPadding(month);
  const today = todayStr();

  return (
    <div>
      <h3 className="text-center text-sm font-semibold text-foreground mb-3">
        {formatMonthYear(month)}
      </h3>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center text-[10px] font-medium text-muted-foreground py-1"
          >
            {wd}
          </div>
        ))}

        {padding > 0 && <div style={{ gridColumn: `span ${padding}` }} />}

        {days.map((day) => {
          const dateStr = formatDate(day);
          const past = dateStr < today;
          const availability = availabilityMap[dateStr];
          const isFull =
            availability != null &&
            availability.bookedParticipants >= maxParticipants;
          const disabled = past || isFull;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onDateClick(dateStr)}
              className={cn(
                "relative flex flex-col items-center justify-center py-1.5 rounded-lg text-xs transition-colors min-h-[44px]",
                disabled ? "text-muted-foreground/40 cursor-not-allowed" : "hover:bg-primary/20 cursor-pointer",
                past && "line-through",
                isSelected && "bg-primary text-primary-foreground"
              )}
            >
              <span className="font-medium">{day.getDate()}</span>
              {isFull && !past && (
                <span className="text-[8px] font-semibold text-red-400 mt-0.5">
                  Full
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
