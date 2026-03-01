import { CalendarGrid } from "@/features/public/booking/ui/CalendarGrid";
import { useSearchCalendar } from "@/features/public/search/hooks/useSearchCalendar";
import { useLocale } from "@/i18n/react/LocaleProvider";
import { Select } from "@/modules/ui/Select";
import { useIsMobile } from "@/modules/ui/useIsMobile";
import { cn } from "@/modules/utils/cn";
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
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

const EMPTY_RATE_MAP = {} as Record<string, never>;

export function SearchBar({
  cities,
  defaultCity = "",
  defaultCheckIn = "",
  defaultCheckOut = "",
  defaultGuests = "",
  variant = "hero",
}: SearchBarProps) {
  const { t, localePath } = useLocale();
  const isMobile = useIsMobile();
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

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "bg-card border border-border rounded-2xl shadow-lg",
        isHero ? "p-3 max-w-2xl mx-auto" : "p-2"
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
        <div className="flex-1 min-w-0">
          <Select
            value={city}
            onChange={setCity}
            options={cityOptions}
            placeholder={t("search.cityPlaceholder")}
            className={cn(
              "!rounded-xl !border-0 !bg-secondary/50 !shadow-none !text-sm",
              isHero ? "!h-12" : "!h-10"
            )}
          />
        </div>

        {/* Date picker trigger — 2x width of other dropdowns */}
        <div className="flex-[2] min-w-0">
          {isMobile ? (
            <MobileDatePicker calendar={calendar} isHero={isHero} />
          ) : (
            <DesktopDatePicker calendar={calendar} isHero={isHero} />
          )}
        </div>

        {/* Guests dropdown */}
        <div className="flex-1 min-w-0">
          <Select
            value={guests}
            onChange={setGuests}
            options={GUEST_OPTIONS}
            placeholder={t("search.guestsPlaceholder")}
            className={cn(
              "!rounded-xl !border-0 !bg-secondary/50 !shadow-none !text-sm",
              isHero ? "!h-12" : "!h-10"
            )}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={cn(
            "shrink-0 rounded-xl bg-primary text-primary-foreground font-semibold transition-colors hover:bg-primary-hover text-sm px-6",
            isHero ? "h-12" : "h-10"
          )}
        >
          {t("search.searchButton")}
        </button>
      </div>
    </form>
  );
}

type DatePickerProps = {
  calendar: ReturnType<typeof useSearchCalendar>;
  isHero: boolean;
};

function DesktopDatePicker({ calendar, isHero }: DatePickerProps) {
  const { refs, floatingStyles, context } = useFloating({
    open: calendar.isOpen,
    onOpenChange: calendar.setIsOpen,
    middleware: [offset(8), flip(), shift({ padding: 16 })],
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className={cn(
          "w-full text-left rounded-xl bg-secondary/50 transition-colors hover:bg-secondary/80 flex items-center px-4",
          isHero ? "h-12" : "h-10"
        )}
        {...getReferenceProps()}
      >
        <DateTriggerCompact
          checkIn={calendar.checkIn}
          checkOut={calendar.checkOut}
        />
      </button>

      {calendar.isOpen && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
            closeOnFocusOut={false}
          >
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="z-50 min-w-[600px] p-5 rounded-2xl bg-card border border-border shadow-2xl shadow-black/40"
              {...getFloatingProps()}
            >
              <CalendarGrid
                currentMonth={calendar.currentMonth}
                checkIn={calendar.checkIn}
                checkOut={calendar.checkOut}
                rateMap={EMPTY_RATE_MAP}
                ratesLoading={false}
                currency={null}
                onDateClick={calendar.handleDateClick}
                onPrevMonth={calendar.goPrevMonth}
                onNextMonth={calendar.goNextMonth}
              />
              <div className="mt-3 pt-3 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={calendar.handleConfirm}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

function MobileDatePicker({ calendar, isHero }: DatePickerProps) {
  return (
    <>
      <button
        type="button"
        className={cn(
          "w-full text-left rounded-xl bg-secondary/50 transition-colors hover:bg-secondary/80 flex items-center px-4",
          isHero ? "h-12" : "h-10"
        )}
        onClick={() => calendar.setIsOpen(true)}
      >
        <DateTriggerCompact
          checkIn={calendar.checkIn}
          checkOut={calendar.checkOut}
        />
      </button>

      {calendar.isOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 w-full h-full cursor-default"
            onClick={() => calendar.setIsOpen(false)}
            aria-label="Close calendar"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
              <CalendarGrid
                currentMonth={calendar.currentMonth}
                checkIn={calendar.checkIn}
                checkOut={calendar.checkOut}
                rateMap={EMPTY_RATE_MAP}
                ratesLoading={false}
                currency={null}
                onDateClick={calendar.handleDateClick}
                vertical
                monthCount={12}
              />
            </div>
            <div className="px-4 py-3 border-t border-border bg-card shrink-0">
              <button
                type="button"
                onClick={calendar.handleConfirm}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DateTriggerCompact({
  checkIn,
  checkOut,
}: { checkIn: string | null; checkOut: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        aria-hidden="true"
        className="w-4 h-4 text-muted-foreground shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
      <span
        className={cn(
          "text-sm",
          checkIn ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {checkIn ?? "Check-in"}
      </span>
      <span className="text-muted-foreground text-xs">→</span>
      <span
        className={cn(
          "text-sm",
          checkOut ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {checkOut ?? "Check-out"}
      </span>
    </div>
  );
}
