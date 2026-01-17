import { useEffect } from "react";
import type { BookingContext } from "../domain/pricing";
import { initBookingContext, initializeBooking } from "../store/bookingStore";

type BookingInitializerProps = {
  context?: BookingContext;
  // Legacy props (deprecated)
  pricePerNight?: number;
  currency?: string;
  propertyId?: string;
  propertyTitle?: string;
  maxGuests?: number;
};

/**
 * Invisible island that initializes the booking store with property data.
 * Accepts either a full BookingContext (new) or individual props (legacy).
 */
export default function BookingInitializer({
  context,
  pricePerNight,
  currency,
  propertyId,
  propertyTitle,
  maxGuests,
}: BookingInitializerProps) {
  useEffect(() => {
    if (context) {
      // New context-aware initialization
      initBookingContext(context);
    } else if (pricePerNight !== undefined && propertyId) {
      // Legacy initialization (backward compatibility)
      initializeBooking({
        pricePerNight,
        currency: currency ?? "EUR",
        propertyId,
        propertyTitle: propertyTitle ?? "",
        maxGuests: maxGuests ?? 2,
      });
    }
  }, [context, pricePerNight, currency, propertyId, propertyTitle, maxGuests]);

  // This component renders nothing - it just initializes the store
  return null;
}
