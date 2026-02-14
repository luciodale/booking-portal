import {
  formatDate,
  formatMonthYear,
  formatPrice,
  getMonthDays,
  getStartPadding,
  isBeforeToday,
  isSame,
  addMonths,
} from "@/features/public/booking/domain/dateUtils";
import type { SmoobuRateDay } from "@/schemas/smoobu";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type CalendarGridProps = {
  currentMonth: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  rateMap: Record<string, SmoobuRateDay>;
  ratesLoading: boolean;
  currency: string;
  onDateClick: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export function CalendarGrid({
  currentMonth,
  checkIn,
  checkOut,
  rateMap,
  ratesLoading,
  currency,
  onDateClick,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const months = [currentMonth, addMonths(currentMonth, 1)];

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {months.map((month) => (
          <MonthGrid
            key={formatDate(month)}
            month={month}
            checkIn={checkIn}
            checkOut={checkOut}
            rateMap={rateMap}
            ratesLoading={ratesLoading}
            currency={currency}
            onDateClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
}

function MonthGrid({
  month,
  checkIn,
  checkOut,
  rateMap,
  ratesLoading,
  currency,
  onDateClick,
}: {
  month: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  rateMap: Record<string, SmoobuRateDay>;
  ratesLoading: boolean;
  currency: string;
  onDateClick: (date: Date) => void;
}) {
  const days = getMonthDays(month);
  const padding = getStartPadding(month);

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

        {Array.from({ length: padding }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = formatDate(day);
          const rate = rateMap[dateStr];
          const past = isBeforeToday(day);
          const unavailable = past || (rate !== undefined && rate.available === 0);
          const isCheckIn = checkIn ? isSame(day, checkIn) : false;
          const isCheckOut = checkOut ? isSame(day, checkOut) : false;
          const inRange =
            checkIn && checkOut && day > checkIn && day < checkOut;

          const price = rate?.price;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={unavailable}
              onClick={() => onDateClick(day)}
              className={`
                relative flex flex-col items-center justify-center py-1.5 rounded-lg text-xs
                transition-colors min-h-[44px]
                ${unavailable ? "text-muted-foreground/40 cursor-not-allowed line-through" : "hover:bg-primary/20 cursor-pointer"}
                ${isCheckIn ? "bg-primary text-primary-foreground rounded-r-none" : ""}
                ${isCheckOut ? "bg-primary text-primary-foreground rounded-l-none" : ""}
                ${inRange ? "bg-primary/10" : ""}
              `}
            >
              <span className="font-medium">{day.getDate()}</span>
              {!ratesLoading && price != null && !past && (
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  {formatPrice(price, currency)}
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
