import { useBookingCalendar } from "@/features/public/booking/hooks/useBookingCalendar";
import { formatDate } from "@/features/public/booking/domain/dateUtils";
import { CalendarGrid } from "@/features/public/booking/ui/CalendarGrid";
import { PriceDisplay } from "@/features/public/booking/ui/PriceDisplay";
import { BookingForm } from "@/features/public/booking/ui/BookingForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

type BookingWidgetProps = {
  propertyId: string;
  smoobuPropertyId: number | null;
  maxGuests: number;
  currency: string;
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
  currency,
}: BookingWidgetProps) {
  const calendar = useBookingCalendar(propertyId, smoobuPropertyId);
  const [showForm, setShowForm] = useState(false);

  const isAvailable =
    !!calendar.availabilityResult &&
    !!smoobuPropertyId &&
    calendar.availabilityResult.availableApartments.includes(smoobuPropertyId);

  function handleFormSubmit(data: Record<string, unknown>) {
    // Placeholder: combine dates + guest data for future Stripe integration
    console.log("Booking submission:", {
      propertyId,
      checkIn: calendar.checkIn ? formatDate(calendar.checkIn) : null,
      checkOut: calendar.checkOut ? formatDate(calendar.checkOut) : null,
      ...data,
    });
  }

  if (!smoobuPropertyId) {
    return (
      <div className="p-7 rounded-2xl bg-card border border-border">
        <div className="text-sm text-muted-foreground">
          Contact us for availability and pricing
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl bg-card border border-border">
        <CalendarGrid
          currentMonth={calendar.currentMonth}
          checkIn={calendar.checkIn}
          checkOut={calendar.checkOut}
          rateMap={calendar.rateMap}
          ratesLoading={calendar.ratesLoading}
          currency={currency}
          onDateClick={calendar.handleDateClick}
          onPrevMonth={calendar.goPrevMonth}
          onNextMonth={calendar.goNextMonth}
        />

        {(calendar.checkIn || calendar.checkOut) && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-muted-foreground">
                {calendar.checkIn && !calendar.checkOut && "Select check-out date"}
                {calendar.checkIn && calendar.checkOut && (
                  <span>
                    {formatDate(calendar.checkIn)} &rarr; {formatDate(calendar.checkOut)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={calendar.clearDates}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Clear
              </button>
            </div>

            <PriceDisplay
              checkIn={calendar.checkIn}
              checkOut={calendar.checkOut}
              smoobuPropertyId={smoobuPropertyId}
              currency={currency}
              availabilityResult={calendar.availabilityResult}
              availabilityLoading={calendar.availabilityLoading}
              availabilityError={calendar.availabilityError}
            />
          </div>
        )}
      </div>

      {isAvailable && !showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Reserve Now
        </button>
      )}

      {showForm && (
        <div className="p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Guest Information</h3>
          <BookingForm
            maxGuests={maxGuests}
            isAvailable={isAvailable}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      <div className="p-4 rounded-xl bg-card border border-border">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-1 text-foreground hover:text-primary transition-colors font-medium text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
          Contact Host
        </button>
      </div>
    </div>
  );
}
