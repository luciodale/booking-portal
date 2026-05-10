import type {
  CityTax,
  PropertyAdditionalCost,
} from "@/features/public/booking/domain/pricingTypes";
import { useBookingCalendar } from "@/features/public/booking/hooks/useBookingCalendar";
import { useBookingCheckout } from "@/features/public/booking/hooks/useBookingCheckout";
import { useMinStayNotice } from "@/features/public/booking/hooks/useMinStayNotice";
import type { BookingGuestInput } from "@/features/public/booking/ui/BookingForm";
import { BookingForm } from "@/features/public/booking/ui/BookingForm";
import { CalendarPopover } from "@/features/public/booking/ui/CalendarPopover";
import { MinStayNotice } from "@/features/public/booking/ui/MinStayNotice";
import { PriceDisplay } from "@/features/public/booking/ui/PriceDisplay";
import {
  MobileCalendarBottomSheet,
  MobileCalendarTrigger,
} from "@/features/public/booking/ui/mobile/MobileCalendarSheet";
import { t } from "@/i18n/t";
import type { Locale } from "@/i18n/types";
import { useIsMobile } from "@/modules/ui/useIsMobile";
import { useAuth } from "@clerk/astro/react";
import { SwipeBarProvider, useSwipeBarContext } from "@luciodale/swipe-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

type BookingWidgetProps = {
  propertyId: string;
  smoobuPropertyId: number | null;
  maxGuests: number;
  instantBook: boolean;
  additionalCosts: PropertyAdditionalCost[] | null;
  cityTax: CityTax | null;
  locale?: Locale;
  variant?: "mobile" | "desktop";
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
  cityTax,
  locale = "en",
  variant,
}: BookingWidgetProps) {
  const isMobile = useIsMobile();
  const { openSidebar } = useSwipeBarContext();
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const calendar = useBookingCalendar(propertyId, smoobuPropertyId, guestCount);
  const { minStayNights } = useMinStayNotice(
    calendar.rateMap,
    calendar.checkIn
  );
  const { isSignedIn } = useAuth();
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
  });

  // Block date changes while a checkout submission is in-flight
  const handleDateClick = useCallback(
    (dateStr: string) => {
      if (checkout.isSubmitting) return;
      calendar.handleDateClick(dateStr);
    },
    [checkout.isSubmitting, calendar.handleDateClick]
  );

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

  function handleCalendarOpen() {
    openSidebar("bottom");
    calendar.setCalendarOpen(true);
  }

  return (
    <div data-testid={variant ? `booking-widget-${variant}` : "booking-widget"} className="space-y-5 z-20">
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        {isMobile ? (
          <MobileCalendarTrigger
            checkIn={calendar.checkIn}
            checkOut={calendar.checkOut}
            onOpen={handleCalendarOpen}
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
          guests={guestCount}
          cityTax={cityTax}
          onRetry={calendar.retryDates}
        />

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

      {isMobile && (
        <MobileCalendarBottomSheet
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
    </div>
  );
}
