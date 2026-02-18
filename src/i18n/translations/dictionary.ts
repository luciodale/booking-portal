import type { Locale } from "../types";
import { about as enAbout } from "./en/about";
import { auth as enAuth } from "./en/auth";
import { backoffice as enBackoffice } from "./en/backoffice";
import { booking as enBooking } from "./en/booking";
import { bookings as enBookings } from "./en/bookings";
import { common as enCommon } from "./en/common";
import { elite as enElite } from "./en/elite";
import { errors as enErrors } from "./en/errors";
import { experiences as enExperiences } from "./en/experiences";
import { home as enHome } from "./en/home";
import { property as enProperty } from "./en/property";
import { standard as enStandard } from "./en/standard";
import { about as itAbout } from "./it/about";
import { auth as itAuth } from "./it/auth";
import { backoffice as itBackoffice } from "./it/backoffice";
import { booking as itBooking } from "./it/booking";
import { bookings as itBookings } from "./it/bookings";
import { common as itCommon } from "./it/common";
import { elite as itElite } from "./it/elite";
import { errors as itErrors } from "./it/errors";
import { experiences as itExperiences } from "./it/experiences";
import { home as itHome } from "./it/home";
import { property as itProperty } from "./it/property";
import { standard as itStandard } from "./it/standard";

const en = {
  ...enCommon,
  ...enHome,
  ...enElite,
  ...enStandard,
  ...enExperiences,
  ...enProperty,
  ...enAbout,
  ...enBooking,
  ...enBookings,
  ...enAuth,
  ...enBackoffice,
  ...enErrors,
} as const;

const it = {
  ...itCommon,
  ...itHome,
  ...itElite,
  ...itStandard,
  ...itExperiences,
  ...itProperty,
  ...itAbout,
  ...itBooking,
  ...itBookings,
  ...itAuth,
  ...itBackoffice,
  ...itErrors,
} as const;

export type TranslationKey = keyof typeof en;

export const dictionaries: Record<Locale, Record<string, string>> = {
  en,
  it,
};
