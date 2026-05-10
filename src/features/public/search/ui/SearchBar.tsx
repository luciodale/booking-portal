import { CalendarPopover } from "@/features/public/booking/ui/CalendarPopover";
import { DateTrigger } from "@/features/public/booking/ui/DateTrigger";
import { MobileCalendarBottomSheet } from "@/features/public/booking/ui/mobile/MobileCalendarSheet";
import { useSearchCalendar } from "@/features/public/search/hooks/useSearchCalendar";
import { useLocale } from "@/i18n/react/LocaleProvider";
import { Select } from "@/modules/ui/Select";
import { useIsMobile } from "@/modules/ui/useIsMobile";
import { cn } from "@/modules/utils/cn";
import type { SmoobuRateDay } from "@/schemas/smoobu";
import { SwipeBarProvider, useSwipeBarContext } from "@luciodale/swipe-bar";
import { useCallback, useMemo, useState } from "react";

type SearchBarProps = {
  cities: string[];
  defaultCity?: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: string;
  variant?: "hero" | "compact";
};

const GUEST_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} ${i === 0 ? "guest" : "guests"}`,
}));

const EMPTY_RATE_MAP = {} as Record<string, SmoobuRateDay>;

export function SearchBar(props: SearchBarProps) {
  return (
    <SwipeBarProvider>
      <SearchBarInner {...props} />
    </SwipeBarProvider>
  );
}

function SearchBarInner({
  cities,
  defaultCity = "",
  defaultCheckIn = "",
  defaultCheckOut = "",
  defaultGuests = "",
  variant = "hero",
}: SearchBarProps) {
  const { t, localePath } = useLocale();
  const isMobile = useIsMobile();
  const { openSidebar } = useSwipeBarContext();
  const [city, setCity] = useState(defaultCity);
  const [guests, setGuests] = useState(defaultGuests);
  const calendar = useSearchCalendar(defaultCheckIn, defaultCheckOut);

  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: c, label: c })),
    [cities]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = city.trim();
      if (!trimmed) return;

      const params = new URLSearchParams({ city: trimmed });
      if (calendar.checkIn) params.set("checkIn", calendar.checkIn);
      if (calendar.checkOut) params.set("checkOut", calendar.checkOut);
      if (guests) params.set("guests", guests);
      window.location.href = `${localePath("/search")}?${params.toString()}`;
    },
    [city, calendar.checkIn, calendar.checkOut, guests, localePath]
  );

  function handleCalendarOpen() {
    openSidebar("bottom");
    calendar.setCalendarOpen(true);
  }

  function handleDateClick(dateStr: string) {
    calendar.handleDateClick(dateStr);
  }

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "bg-card rounded-2xl ring-2 ring-primary/50",
        isHero ? "p-3 max-w-3xl mx-auto" : "p-2"
      )}
    >
      <div
        className={cn(
          "flex gap-2",
          isHero
            ? "flex-col sm:flex-row items-stretch"
            : "flex-row items-center"
        )}
      >
        {/* City select */}
        <div className="flex-[2] min-w-0">
          <Select
            value={city}
            onChange={setCity}
            options={cityOptions}
            placeholder={t("search.cityPlaceholder")}
            variant="inline"
            className={isHero ? "h-12" : "h-10"}
          />
        </div>

        {/* Date picker */}
        <div className="flex-[3] min-w-0">
          {isMobile ? (
            <button
              type="button"
              className={cn(
                "w-full text-left rounded-xl bg-secondary/50 transition-colors hover:bg-secondary/80 flex items-center px-4",
                isHero ? "h-12" : "h-10"
              )}
              onClick={handleCalendarOpen}
            >
              <DateTrigger
                checkIn={calendar.checkIn}
                checkOut={calendar.checkOut}
                variant="inline"
              />
            </button>
          ) : (
            <CalendarPopover
              isOpen={calendar.isCalendarOpen}
              onOpenChange={calendar.setCalendarOpen}
              currentMonth={calendar.currentMonth}
              checkIn={calendar.checkIn}
              checkOut={calendar.checkOut}
              rateMap={EMPTY_RATE_MAP}
              ratesLoading={false}
              currency={null}
              onDateClick={handleDateClick}
              onPrevMonth={calendar.goPrevMonth}
              onNextMonth={calendar.goNextMonth}
              onConfirm={calendar.confirmCalendar}
              renderTrigger={({ ref, getReferenceProps }) => (
                <button
                  ref={ref}
                  type="button"
                  className={cn(
                    "w-full text-left rounded-xl bg-secondary/50 transition-colors hover:bg-secondary/80 flex items-center px-4",
                    isHero ? "h-12" : "h-10"
                  )}
                  {...getReferenceProps()}
                >
                  <DateTrigger
                    checkIn={calendar.checkIn}
                    checkOut={calendar.checkOut}
                    variant="inline"
                  />
                </button>
              )}
            />
          )}
        </div>

        {/* Guests dropdown */}
        <div className="flex-[1.5] min-w-0">
          <Select
            value={guests}
            onChange={setGuests}
            options={GUEST_OPTIONS}
            placeholder={t("search.guestsPlaceholder")}
            variant="inline"
            className={isHero ? "h-12" : "h-10"}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={cn(
            "shrink-0 rounded-xl font-semibold transition-all text-sm text-white",
            "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
            "shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]",
            isHero ? "h-12 px-8 gap-2 inline-flex items-center" : "h-10 px-6"
          )}
        >
          <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
          {t("search.searchButton")}
        </button>
      </div>

      {isMobile && (
        <MobileCalendarBottomSheet
          isOpen={calendar.isCalendarOpen}
          onOpenChange={calendar.setCalendarOpen}
          currentMonth={calendar.currentMonth}
          checkIn={calendar.checkIn}
          checkOut={calendar.checkOut}
          rateMap={EMPTY_RATE_MAP}
          ratesLoading={false}
          currency={null}
          onDateClick={handleDateClick}
          onPrevMonth={calendar.goPrevMonth}
          onNextMonth={calendar.goNextMonth}
          onConfirm={calendar.confirmCalendar}
        />
      )}
    </form>
  );
}
