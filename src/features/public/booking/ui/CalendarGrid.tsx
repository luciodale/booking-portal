import {
  addMonths,
  formatDate,
  formatMonthYear,
  formatPrice,
  getMonthDays,
  getStartPadding,
  todayStr,
} from "@/features/public/booking/domain/dateUtils";
import type { SmoobuRateDay } from "@/schemas/smoobu";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type CalendarGridProps = {
  currentMonth: Date;
  checkIn: string | null;
  checkOut: string | null;
  rateMap: Record<string, SmoobuRateDay>;
  ratesLoading: boolean;
  currency: string | null;
  onDateClick: (dateStr: string) => void;
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
    <div data-testid="calendar-grid" className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          data-testid="calendar-prev"
          type="button"
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft />
        </button>
        <button
          data-testid="calendar-next"
          type="button"
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
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
  checkIn: string | null;
  checkOut: string | null;
  rateMap: Record<string, SmoobuRateDay>;
  ratesLoading: boolean;
  currency: string | null;
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
          const rate = rateMap[dateStr];
          const past = dateStr < today;
          const unavailable =
            past || (rate !== undefined && rate.available === 0);
          const isCheckIn = dateStr === checkIn;
          const isCheckOut = dateStr === checkOut;
          const inRange =
            checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

          const price = rate?.price;

          return (
            <button
              key={dateStr}
              data-testid={`calendar-day-${dateStr}`}
              type="button"
              disabled={unavailable}
              onClick={() => onDateClick(dateStr)}
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
              {!ratesLoading && price != null && !past && currency && (
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
