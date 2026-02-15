import { createCheckoutSession } from "@/features/public/booking/api/createCheckoutSession";
import { useState } from "react";
import { toast } from "sonner";

type BookingGuestInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  adults: number;
  children: number;
  guestNote?: string;
};

export function useBookingCheckout(params: {
  propertyId: string;
  checkIn: string | null;
  checkOut: string | null;
  nightPriceCents: Record<string, number> | null;
  currency: string | null;
  isSignedIn: boolean | undefined;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitBooking(data: BookingGuestInput) {
    if (!params.isSignedIn) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (
      !params.checkIn ||
      !params.checkOut ||
      !params.nightPriceCents ||
      !params.currency
    ) {
      toast.error("Please select dates and verify availability first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCheckoutSession({
        propertyId: params.propertyId,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: data.adults + data.children,
        currency: params.currency,
        nightPriceCents: params.nightPriceCents,
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

  return { isSubmitting, submitBooking };
}
