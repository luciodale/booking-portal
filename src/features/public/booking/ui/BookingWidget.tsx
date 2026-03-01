import { formatPrice } from "@/features/public/booking/domain/dateUtils";
import type {
  CityTax,
  PropertyAdditionalCost,
  PropertyExtra,
} from "@/features/public/booking/domain/pricingTypes";
import { centsToUnit } from "@/modules/money/money";
import { useBookingCalendar } from "@/features/public/booking/hooks/useBookingCalendar";
import { useBookingCheckout } from "@/features/public/booking/hooks/useBookingCheckout";
import { useMinStayNotice } from "@/features/public/booking/hooks/useMinStayNotice";
import type { BookingGuestInput } from "@/features/public/booking/ui/BookingForm";
import { BookingForm } from "@/features/public/booking/ui/BookingForm";
import { CalendarPopover } from "@/features/public/booking/ui/CalendarPopover";
import { MinStayNotice } from "@/features/public/booking/ui/MinStayNotice";
import { PriceDisplay } from "@/features/public/booking/ui/PriceDisplay";
import { MobileCalendarSheet } from "@/features/public/booking/ui/mobile/MobileCalendarSheet";
import { t } from "@/i18n/t";
import type { Locale } from "@/i18n/types";
import { useIsMobile } from "@/modules/ui/useIsMobile";
import { cn } from "@/modules/utils/cn";
import { useAuth } from "@clerk/astro/react";
import { SwipeBarProvider } from "@luciodale/swipe-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { icons } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

type BookingWidgetProps = {
  propertyId: string;
  smoobuPropertyId: number | null;
  maxGuests: number;
  instantBook: boolean;
  additionalCosts: PropertyAdditionalCost[] | null;
  extras: PropertyExtra[] | null;
  cityTax: CityTax | null;
  locale?: Locale;
};

export function BookingWidget(props: BookingWidgetProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SwipeBarProvider>
        <BookingWidgetInner {...props} />
      </SwipeBarProvider>
    </QueryClientProvider>
  );
}

function BookingWidgetInner({
  propertyId,
  smoobuPropertyId,
  maxGuests,
  instantBook,
  additionalCosts,
  extras,
  cityTax,
  locale = "en",
}: BookingWidgetProps) {
  const isMobile = useIsMobile();
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const calendar = useBookingCalendar(propertyId, smoobuPropertyId, guestCount);
  const { minStayNights } = useMinStayNotice(
    calendar.rateMap,
    calendar.checkIn
  );
  const { isSignedIn } = useAuth();
  const [selectedExtras, setSelectedExtras] = useState<Set<number>>(new Set());
  const formValuesRef = useRef<Partial<BookingGuestInput>>({});
  const handleFormValuesChange = useCallback(
    (values: Partial<BookingGuestInput>) => {
      formValuesRef.current = values;
    },
    []
  );

  const checkout = useBookingCheckout({
    propertyId,
    checkIn: calendar.checkIn,
    checkOut: calendar.checkOut,
    nightPriceCents: calendar.nightPriceCents,
    currency: calendar.currency,
    isSignedIn,
    cityTax,
    extras: extras ?? undefined,
    selectedExtras,
  });

  // Block date changes while a checkout submission is in-flight
  const handleDateClick = useCallback(
    (dateStr: string) => {
      if (checkout.isSubmitting) return;
      calendar.handleDateClick(dateStr);
    },
    [checkout.isSubmitting, calendar.handleDateClick]
  );

  function toggleExtra(index: number) {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  // Listen for "Add" clicks from the static ExtrasSection component
  useEffect(() => {
    function handleAddExtra(e: Event) {
      if (!calendar.isAvailable) return;
      const index = (e as CustomEvent<number>).detail;
      setSelectedExtras((prev) => new Set(prev).add(index));
    }
    window.addEventListener("extras:add", handleAddExtra);
    return () => window.removeEventListener("extras:add", handleAddExtra);
  }, [calendar.isAvailable]);

  // Broadcast selection changes so static ExtrasSection buttons can update
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("extras:selection", {
        detail: Array.from(selectedExtras),
      })
    );
  }, [selectedExtras]);

  if (!instantBook) {
    return (
      <div className="p-7 rounded-2xl bg-card border border-border space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          {t(locale, "booking.interestedInProperty")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(locale, "booking.contactForAvailability")}
        </p>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
          {t(locale, "common.contact")}
        </button>
      </div>
    );
  }

  return (
    <div data-testid="booking-widget" className="space-y-5 z-20">
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        {isMobile ? (
          <MobileCalendarSheet
            isOpen={calendar.isCalendarOpen}
            onOpenChange={calendar.setCalendarOpen}
            currentMonth={calendar.currentMonth}
            checkIn={calendar.checkIn}
            checkOut={calendar.checkOut}
            rateMap={calendar.rateMap}
            ratesLoading={calendar.ratesLoading}
            currency={calendar.currency}
            onDateClick={handleDateClick}
            onPrevMonth={calendar.goPrevMonth}
            onNextMonth={calendar.goNextMonth}
            onConfirm={calendar.confirmCalendar}
          />
        ) : (
          <CalendarPopover
            isOpen={calendar.isCalendarOpen}
            onOpenChange={calendar.setCalendarOpen}
            currentMonth={calendar.currentMonth}
            checkIn={calendar.checkIn}
            checkOut={calendar.checkOut}
            rateMap={calendar.rateMap}
            ratesLoading={calendar.ratesLoading}
            currency={calendar.currency}
            onDateClick={handleDateClick}
            onPrevMonth={calendar.goPrevMonth}
            onNextMonth={calendar.goNextMonth}
            onConfirm={calendar.confirmCalendar}
          />
        )}

        <MinStayNotice minStayNights={minStayNights} />

        <PriceDisplay
          checkIn={calendar.checkIn}
          checkOut={calendar.checkOut}
          smoobuPropertyId={smoobuPropertyId}
          currency={calendar.currency}
          nightPriceCents={calendar.nightPriceCents}
          totalPriceCents={calendar.totalPriceCents}
          availabilityResult={calendar.availabilityResult}
          availabilityLoading={calendar.availabilityLoading}
          availabilityError={calendar.availabilityError}
          additionalCosts={additionalCosts}
          extras={extras}
          selectedExtras={selectedExtras}
          guests={guestCount}
          cityTax={cityTax}
          onRetry={calendar.retryDates}
        />

        {calendar.checkIn && calendar.checkOut && extras && extras.length > 0 && (
          <>
            <div className="border-t border-border" />
            <h3 className="text-sm font-semibold text-foreground">
              {t(locale, "booking.optionalExtras")}
            </h3>
            <div className="space-y-2">
              {extras.map((extra, index) => {
                const isSelected = selectedExtras.has(index);
                const Icon = icons[extra.icon as keyof typeof icons];
                const perLabel =
                  extra.per === "stay"
                    ? ""
                    : extra.per === "night"
                      ? t(locale, "booking.perNight")
                      : extra.per === "guest"
                        ? t(locale, "booking.perGuest")
                        : t(locale, "booking.perNightGuest");
                return (
                  <button
                    key={extra.name}
                    type="button"
                    onClick={() => toggleExtra(index)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "w-5 h-5 shrink-0",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground">
                        {extra.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                      {formatPrice(
                        centsToUnit(extra.amount),
                        calendar.currency ?? "EUR"
                      )}
                      {perLabel}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 shrink-0">
                        <svg
                          aria-hidden="true"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {calendar.checkIn && calendar.checkOut && (
          <>
            <div className="border-t border-border" />
            <h3 className="text-sm font-semibold text-foreground">
              {t(locale, "booking.guestInformation")}
            </h3>
            <BookingForm
              maxGuests={maxGuests}
              isAvailable={calendar.isAvailable}
              isSubmitting={checkout.isSubmitting}
              savedValues={formValuesRef.current}
              onSubmit={checkout.submitBooking}
              onGuestsChange={setGuestCount}
              onValuesChange={handleFormValuesChange}
            />
          </>
        )}
      </div>

      <div className="p-4 rounded-xl bg-card border border-border">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-1 text-foreground hover:text-primary transition-colors font-medium text-sm"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
          {t(locale, "common.contactHost")}
        </button>
      </div>
    </div>
  );
}
