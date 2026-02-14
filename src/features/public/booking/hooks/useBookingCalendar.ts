import {
  addMonths,
  formatDate,
  startOfToday,
  subMonths,
} from "@/features/public/booking/domain/dateUtils";
import { useBookingDatesFromUrl } from "@/features/public/booking/hooks/useBookingDatesFromUrl";
import { usePropertyAvailability } from "@/features/public/booking/hooks/usePropertyAvailability";
import { usePropertyRates } from "@/features/public/booking/hooks/usePropertyRates";
import type { SmoobuRateDay } from "@/schemas/smoobu";
import { endOfMonth, startOfMonth } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useBookingCalendar(
  propertyId: string,
  smoobuPropertyId: number | null
) {
  const {
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    clearDates: clearUrlDates,
    hadDatesFromUrl,
  } = useBookingDatesFromUrl();

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (checkIn) return startOfMonth(checkIn);
    return startOfToday();
  });

  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [hasCalendarBeenOpened, setHasCalendarBeenOpened] = useState(false);

  useEffect(() => {
    if (isCalendarOpen && !hasCalendarBeenOpened) {
      setHasCalendarBeenOpened(true);
    }
  }, [isCalendarOpen, hasCalendarBeenOpened]);

  // Fetch rates only after calendar has been opened at least once
  const rangeStart = formatDate(startOfMonth(currentMonth));
  const rangeEnd = formatDate(endOfMonth(addMonths(currentMonth, 1)));

  const ratesQuery = usePropertyRates({
    propertyId,
    startDate: rangeStart,
    endDate: rangeEnd,
    enabled: hasCalendarBeenOpened && !!smoobuPropertyId,
  });

  const availabilityMutation = usePropertyAvailability(propertyId);

  const currency = ratesQuery.data?.currency ?? null;

  const rateMap = useMemo((): Record<string, SmoobuRateDay> => {
    if (!ratesQuery.data?.rates.data || !smoobuPropertyId) return {};
    return ratesQuery.data.rates.data[String(smoobuPropertyId)] ?? {};
  }, [ratesQuery.data, smoobuPropertyId]);

  // Auto-trigger availability check when dates come from URL
  const hasTriggeredUrlAvailability = useRef(false);
  useEffect(() => {
    if (hasTriggeredUrlAvailability.current) return;
    if (!hadDatesFromUrl || !checkIn || !checkOut) return;
    hasTriggeredUrlAvailability.current = true;
    availabilityMutation.mutate({
      arrivalDate: formatDate(checkIn),
      departureDate: formatDate(checkOut),
    });
  });

  const goNextMonth = useCallback(() => {
    setCurrentMonth((m) => addMonths(m, 1));
  }, []);

  const goPrevMonth = useCallback(() => {
    setCurrentMonth((m) => subMonths(m, 1));
  }, []);

  function handleDateClick(date: Date) {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
      availabilityMutation.reset();
    } else if (date > checkIn) {
      setCheckOut(date);
      setCalendarOpen(false);
      availabilityMutation.mutate({
        arrivalDate: formatDate(checkIn),
        departureDate: formatDate(date),
        currency: currency ?? undefined,
      });
    } else {
      setCheckIn(date);
      setCheckOut(null);
      availabilityMutation.reset();
    }
  }

  function clearDates() {
    clearUrlDates();
    setCalendarOpen(false);
    availabilityMutation.reset();
  }

  const isAvailable =
    !!availabilityMutation.data &&
    !!smoobuPropertyId &&
    availabilityMutation.data.availableApartments.includes(smoobuPropertyId);

  const totalPrice =
    availabilityMutation.data && smoobuPropertyId
      ? (availabilityMutation.data.prices[String(smoobuPropertyId)]?.price ??
          null)
      : null;

  return {
    currentMonth,
    checkIn,
    checkOut,
    rateMap,
    currency,
    ratesLoading: ratesQuery.isLoading,
    availabilityResult: availabilityMutation.data ?? null,
    availabilityLoading: availabilityMutation.isPending,
    availabilityError: availabilityMutation.error,
    isCalendarOpen,
    setCalendarOpen,
    isAvailable,
    totalPrice,
    goNextMonth,
    goPrevMonth,
    handleDateClick,
    clearDates,
  };
}
