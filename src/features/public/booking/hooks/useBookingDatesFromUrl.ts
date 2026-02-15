import { formatDate } from "@/features/public/booking/domain/dateUtils";
import { isValid, parseISO } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";

function parseDateParam(value: string | null): Date | null {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

function syncDatesToUrl(checkIn: Date | null, checkOut: Date | null) {
  const params = new URLSearchParams(window.location.search);
  if (checkIn) {
    params.set("checkIn", formatDate(checkIn));
  } else {
    params.delete("checkIn");
  }
  if (checkOut) {
    params.set("checkOut", formatDate(checkOut));
  } else {
    params.delete("checkOut");
  }
  const query = params.toString();
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  history.replaceState(null, "", newUrl);
}

export function useBookingDatesFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const initialCheckIn = parseDateParam(params.get("checkIn"));
  const initialCheckOut = parseDateParam(params.get("checkOut"));

  const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut);

  const hadDatesFromUrl = useRef(
    initialCheckIn !== null && initialCheckOut !== null
  );

  useEffect(() => {
    syncDatesToUrl(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const clearDates = useCallback(() => {
    setCheckIn(null);
    setCheckOut(null);
  }, []);

  return {
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    clearDates,
    hadDatesFromUrl: hadDatesFromUrl.current,
  };
}
