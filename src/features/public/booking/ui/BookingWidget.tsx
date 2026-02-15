import type {
  CityTax,
  PropertyAdditionalCost,
} from "@/features/public/booking/domain/pricingTypes";
import { useBookingCalendar } from "@/features/public/booking/hooks/useBookingCalendar";
import { useBookingCheckout } from "@/features/public/booking/hooks/useBookingCheckout";
import { BookingForm } from "@/features/public/booking/ui/BookingForm";
import { CalendarPopover } from "@/features/public/booking/ui/CalendarPopover";
import { PriceDisplay } from "@/features/public/booking/ui/PriceDisplay";
import { useAuth } from "@clerk/astro/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

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
};

export function BookingWidget(props: BookingWidgetProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BookingWidgetInner {...props} />
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
}: BookingWidgetProps) {
  const calendar = useBookingCalendar(propertyId, smoobuPropertyId);
  const { isSignedIn } = useAuth();
  const [guestCount, setGuestCount] = useState<number | null>(null);

  const checkout = useBookingCheckout({
    propertyId,
    checkIn: calendar.checkIn,
    checkOut: calendar.checkOut,
    nightPriceCents: calendar.nightPriceCents,
    currency: calendar.currency,
    isSignedIn,
    cityTax,
  });

  if (!instantBook) {
    return (
      <div className="p-7 rounded-2xl bg-card border border-border space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Interested in this property?
        </h3>
        <p className="text-sm text-muted-foreground">
          Contact us for availability and pricing
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
          Contact
        </button>
      </div>
    );
  }

  return (
    <div data-testid="booking-widget" className="space-y-5">
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        <CalendarPopover
          isOpen={calendar.isCalendarOpen}
          onOpenChange={calendar.setCalendarOpen}
          currentMonth={calendar.currentMonth}
          checkIn={calendar.checkIn}
          checkOut={calendar.checkOut}
          rateMap={calendar.rateMap}
          ratesLoading={calendar.ratesLoading}
          currency={calendar.currency}
          onDateClick={calendar.handleDateClick}
          onPrevMonth={calendar.goPrevMonth}
          onNextMonth={calendar.goNextMonth}
          onConfirm={calendar.confirmCalendar}
        />

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

        {calendar.isAvailable && (
          <>
            <div className="border-t border-border" />
            <h3 className="text-sm font-semibold text-foreground">
              Guest Information
            </h3>
            <BookingForm
              maxGuests={maxGuests}
              isAvailable={calendar.isAvailable}
              isSubmitting={checkout.isSubmitting}
              onSubmit={checkout.submitBooking}
              onGuestsChange={setGuestCount}
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
          Contact Host
        </button>
      </div>
    </div>
  );
}
