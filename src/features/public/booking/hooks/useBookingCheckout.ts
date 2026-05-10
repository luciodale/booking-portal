import { createCheckoutSession } from "@/features/public/booking/api/createCheckoutSession";
import type { CityTax } from "@/features/public/booking/domain/pricingTypes";
import { buildSignInRedirect } from "@/modules/auth/redirect";
import { multiplyCents } from "@/modules/money/money";
import { showError } from "@/modules/ui/react/stores/notificationStore";
import { nanoid } from "nanoid";
import { useState } from "react";

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
  cityTax?: CityTax | null;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitBooking(data: BookingGuestInput) {
    if (!params.isSignedIn) {
      window.location.href = buildSignInRedirect();
      return;
    }

    if (
      !params.checkIn ||
      !params.checkOut ||
      !params.nightPriceCents ||
      !params.currency
    ) {
      showError("Please select dates and verify availability first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const guests = data.adults + data.children;
      const nights = Object.keys(params.nightPriceCents).length;
      let cityTaxCents = 0;
      if (params.cityTax && params.cityTax.amount > 0) {
        const effectiveNights =
          params.cityTax.maxNights != null
            ? Math.min(nights, params.cityTax.maxNights)
            : nights;
        cityTaxCents = multiplyCents(
          multiplyCents(params.cityTax.amount, effectiveNights),
          guests
        );
      }

      const result = await createCheckoutSession({
        propertyId: params.propertyId,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests,
        currency: params.currency,
        nightPriceCents: params.nightPriceCents,
        cityTaxCents,
        selectedExtraIndices: [],
        guestInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          adults: data.adults,
          children: data.children,
          guestNote: data.guestNote,
        },
        // Per submit nonce. Submit retries on the same nonce hit the Stripe
        // idempotency cache; a fresh submit always creates a new session.
        requestNonce: nanoid(),
      });
      window.location.href = result.url;
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Something didn't work. Please try again or contact the host."
      );
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, submitBooking };
}
