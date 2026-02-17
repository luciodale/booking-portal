import { createCheckoutSession } from "@/features/public/booking/api/createCheckoutSession";
import type {
  CityTax,
  PropertyExtra,
} from "@/features/public/booking/domain/pricingTypes";
import { buildSignInRedirect } from "@/modules/auth/redirect";
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
  cityTax?: CityTax | null;
  extras?: PropertyExtra[];
  selectedExtras?: Set<number>;
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
      toast.error("Please select dates and verify availability first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const guests = data.adults + data.children;
      const nights = Object.keys(params.nightPriceCents).length;
      let cityTaxCents = 0;
      if (params.cityTax) {
        const effectiveNights =
          params.cityTax.maxNights != null
            ? Math.min(nights, params.cityTax.maxNights)
            : nights;
        cityTaxCents = params.cityTax.amount * effectiveNights * guests;
      }

      const selectedExtraIndices = params.selectedExtras
        ? Array.from(params.selectedExtras)
        : [];

      const result = await createCheckoutSession({
        propertyId: params.propertyId,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests,
        currency: params.currency,
        nightPriceCents: params.nightPriceCents,
        cityTaxCents,
        selectedExtraIndices,
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
          : "Something didn't work. Please try again or contact the host."
      );
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, submitBooking };
}
