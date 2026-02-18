import type { booking as en } from "../en/booking";

export const booking: Record<keyof typeof en, string> = {
  "booking.interestedInProperty": "Interessato a questa proprietà?",
  "booking.contactForAvailability":
    "Contattaci per disponibilità e prezzi",
  "booking.optionalExtras": "Extra Opzionali",
  "booking.guestInformation": "Informazioni Ospite",
  "booking.perNight": "/notte",
  "booking.perGuest": "/ospite",
  "booking.perNightGuest": "/notte/ospite",
};
