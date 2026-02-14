import { createCheckoutSession } from "@/features/public/booking/api/createCheckoutSession";
import { useBookingCalendar } from "@/features/public/booking/hooks/useBookingCalendar";
import { BookingForm } from "@/features/public/booking/ui/BookingForm";
import { CalendarPopover } from "@/features/public/booking/ui/CalendarPopover";
import { PriceDisplay } from "@/features/public/booking/ui/PriceDisplay";
import { useUser } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

type BookingWidgetProps = {
  propertyId: string;
  smoobuPropertyId: number | null;
  maxGuests: number;
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
}: BookingWidgetProps) {
  const calendar = useBookingCalendar(propertyId, smoobuPropertyId);
  const { isSignedIn } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAvailable =
    !!calendar.availabilityResult &&
    !!smoobuPropertyId &&
    calendar.availabilityResult.availableApartments.includes(smoobuPropertyId);

  const totalPrice =
    calendar.availabilityResult && smoobuPropertyId
      ? (calendar.availabilityResult.prices[String(smoobuPropertyId)]?.price ??
        null)
      : null;

  async function handleFormSubmit(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    adults: number;
    children: number;
    guestNote?: string;
  }) {
    if (!isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (!calendar.checkIn || !calendar.checkOut || totalPrice == null) {
      toast.error("Please select dates and verify availability first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCheckoutSession({
        propertyId,
        checkIn: calendar.checkIn.toISOString().split("T")[0],
        checkOut: calendar.checkOut.toISOString().split("T")[0],
        guests: data.adults + data.children,
        currency: calendar.currency,
        totalPrice,
        guestInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          adults: data.adults,
          children: data.children,
          guestNote: data.guestNote,
        },
      });
      window.location.href = result.url;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create checkout session"
      );
      setIsSubmitting(false);
    }
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
    <div data-testid="booking-widget" className="space-y-5">
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        <CalendarPopover
          currentMonth={calendar.currentMonth}
          checkIn={calendar.checkIn}
          checkOut={calendar.checkOut}
          rateMap={calendar.rateMap}
          ratesLoading={calendar.ratesLoading}
          currency={calendar.currency}
          onDateClick={calendar.handleDateClick}
          onPrevMonth={calendar.goPrevMonth}
          onNextMonth={calendar.goNextMonth}
          onClear={calendar.clearDates}
        />

        <PriceDisplay
          checkIn={calendar.checkIn}
          checkOut={calendar.checkOut}
          smoobuPropertyId={smoobuPropertyId}
          currency={calendar.currency}
          rateMap={calendar.rateMap}
          availabilityResult={calendar.availabilityResult}
          availabilityLoading={calendar.availabilityLoading}
          availabilityError={calendar.availabilityError}
        />

        {isAvailable && (
          <>
            <div className="border-t border-border" />
            <h3 className="text-sm font-semibold text-foreground">
              Guest Information
            </h3>
            <BookingForm
              maxGuests={maxGuests}
              isAvailable={isAvailable}
              isSubmitting={isSubmitting}
              onSubmit={handleFormSubmit}
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
