import { formatPrice } from "@/features/public/booking/domain/dateUtils";
import type { ExperienceAdditionalCost } from "@/features/public/booking/domain/pricingTypes";
import { useExperienceBooking } from "@/features/public/booking/hooks/useExperienceBooking";
import { useExperienceCheckout } from "@/features/public/booking/hooks/useExperienceCheckout";
import { ExperienceCalendarPopover } from "@/features/public/booking/ui/ExperienceCalendarPopover";
import { ExperienceGuestForm } from "@/features/public/booking/ui/ExperienceGuestForm";
import { MobileExperienceCalendarSheet } from "@/features/public/booking/ui/mobile/MobileExperienceCalendarSheet";
import { useIsMobile } from "@/modules/ui/useIsMobile";
import { PriceBreakdown } from "@/features/public/booking/ui/PriceBreakdown";
import { useAuth } from "@clerk/astro/react";
import { SwipeBarProvider } from "@luciodale/swipe-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

type ExperienceBookingWidgetProps = {
  experienceId: string;
  basePrice: number;
  currency: string;
  maxParticipants: number;
  instantBook: boolean;
  additionalCosts: ExperienceAdditionalCost[] | null;
};

export function ExperienceBookingWidget(props: ExperienceBookingWidgetProps) {
  if (!props.instantBook) {
    return <ContactCard />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SwipeBarProvider>
        <BookingFlow {...props} />
      </SwipeBarProvider>
    </QueryClientProvider>
  );
}

function ContactCard() {
  return (
    <div className="p-7 rounded-2xl bg-card border border-border space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Interested in this experience?
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

function BookingFlow({
  experienceId,
  basePrice,
  currency,
  maxParticipants,
  additionalCosts,
}: ExperienceBookingWidgetProps) {
  const isMobile = useIsMobile();
  const { isSignedIn } = useAuth();
  const booking = useExperienceBooking({
    experienceId,
    basePrice,
    maxParticipants,
    currency,
    additionalCosts,
  });
  const checkout = useExperienceCheckout({
    experienceId,
    selectedDate: booking.selectedDate,
    participants: booking.participants,
    currency,
    isSignedIn,
  });

  const symbol = currency === "eur" ? "\u20AC" : `${currency.toUpperCase()} `;

  const priceLineItems = [
    {
      label: `${symbol}${(basePrice / 100).toLocaleString()} x ${booking.participants} participant${booking.participants !== 1 ? "s" : ""}`,
      amountCents: booking.baseTotalCents,
    },
    ...booking.additionalCostItems,
  ];

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Price per person
          </span>
          <span className="text-lg font-bold text-foreground">
            {formatPrice(basePrice / 100, currency)}
          </span>
        </div>

        {/* Date Picker */}
        {isMobile ? (
          <MobileExperienceCalendarSheet
            isOpen={booking.isCalendarOpen}
            onOpenChange={booking.setCalendarOpen}
            currentMonth={booking.currentMonth}
            selectedDate={booking.selectedDate}
            availabilityMap={booking.availabilityMap}
            maxParticipants={maxParticipants}
            onDateClick={booking.handleDateClick}
            onPrevMonth={booking.goPrevMonth}
            onNextMonth={booking.goNextMonth}
            onClear={booking.clearDate}
          />
        ) : (
          <ExperienceCalendarPopover
            isOpen={booking.isCalendarOpen}
            onOpenChange={booking.setCalendarOpen}
            currentMonth={booking.currentMonth}
            selectedDate={booking.selectedDate}
            availabilityMap={booking.availabilityMap}
            maxParticipants={maxParticipants}
            onDateClick={booking.handleDateClick}
            onPrevMonth={booking.goPrevMonth}
            onNextMonth={booking.goNextMonth}
            onClear={booking.clearDate}
          />
        )}

        {/* Participants */}
        <div>
          <label
            htmlFor="exp-participants"
            className="block text-xs text-muted-foreground mb-1"
          >
            Participants
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                booking.handleParticipantsChange(booking.participants - 1)
              }
              disabled={booking.participants <= 1}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            <span className="text-foreground font-medium min-w-[2ch] text-center">
              {booking.participants}
            </span>
            <button
              type="button"
              onClick={() =>
                booking.handleParticipantsChange(booking.participants + 1)
              }
              disabled={booking.participants >= maxParticipants}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
            <span className="text-xs text-muted-foreground ml-auto">
              max {maxParticipants}
            </span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="pt-3 border-t border-border">
          <PriceBreakdown
            items={priceLineItems}
            total={{ label: "Total", amountCents: booking.totalPriceCents }}
            currency={currency}
          />
        </div>

        {/* Availability error */}
        {booking.availabilityError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
            <p className="text-sm text-red-400 font-medium">
              Something didn't work
            </p>
            <p className="text-xs text-muted-foreground">
              Please try again or contact the host.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={booking.clearDate}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-white/10 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Full date warning */}
        {booking.isSelectedDateFull && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400 font-medium">
              This date is fully booked
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Contact us — we might find more spots.
            </p>
          </div>
        )}

        {/* Guest form — show when date is selected and not full */}
        {booking.selectedDate && !booking.isSelectedDateFull && (
          <>
            <div className="border-t border-border" />
            <h3 className="text-sm font-semibold text-foreground">
              Guest Information
            </h3>
            <ExperienceGuestForm
              isSubmitting={checkout.isSubmitting}
              hasDate={!!booking.selectedDate}
              onSubmit={checkout.submitBooking}
            />
          </>
        )}
      </div>
    </div>
  );
}
