import { useCallback, useEffect, useRef, useState } from "react";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseDateParam(value: string | null): string | null {
  if (!value) return null;
  return DATE_REGEX.test(value) ? value : null;
}

function syncDatesToUrl(checkIn: string | null, checkOut: string | null) {
  const params = new URLSearchParams(window.location.search);
  if (checkIn) {
    params.set("checkIn", checkIn);
  } else {
    params.delete("checkIn");
  }
  if (checkOut) {
    params.set("checkOut", checkOut);
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

  const [checkIn, setCheckIn] = useState<string | null>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string | null>(initialCheckOut);

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
