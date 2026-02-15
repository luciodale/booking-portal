import {
  getDateRange,
  toCents,
} from "@/features/public/booking/domain/computeStayPrice";
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
import { useCallback, useEffect, useMemo, useState } from "react";

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

  // Track whether we're about to fire the URL-based availability check.
  // This lets PriceDisplay show "loading" instead of "select dates" on first render.
  const [pendingUrlCheck, setPendingUrlCheck] = useState(hadDatesFromUrl);

  useEffect(() => {
    if (isCalendarOpen && !hasCalendarBeenOpened) {
      setHasCalendarBeenOpened(true);
    }
  }, [isCalendarOpen, hasCalendarBeenOpened]);

  // Fetch rates after calendar opened OR when dates come from URL
  const rangeStart = formatDate(startOfMonth(currentMonth));
  const rangeEnd = formatDate(endOfMonth(addMonths(currentMonth, 1)));

  const ratesQuery = usePropertyRates({
    propertyId,
    startDate: rangeStart,
    endDate: rangeEnd,
    enabled: (hasCalendarBeenOpened || hadDatesFromUrl) && !!smoobuPropertyId,
  });

  const availabilityMutation = usePropertyAvailability(propertyId);

  const currency = ratesQuery.data?.currency ?? null;

  const rateMap = useMemo((): Record<string, SmoobuRateDay> => {
    if (!ratesQuery.data?.rates.data || !smoobuPropertyId) return {};
    return ratesQuery.data.rates.data[String(smoobuPropertyId)] ?? {};
  }, [ratesQuery.data, smoobuPropertyId]);

  // Auto-trigger availability check when dates come from URL
  useEffect(() => {
    if (!pendingUrlCheck) return;
    if (!checkIn || !checkOut) return;
    setPendingUrlCheck(false);
    availabilityMutation.mutate({
      arrivalDate: formatDate(checkIn),
      departureDate: formatDate(checkOut),
    });
  }, [pendingUrlCheck, checkIn, checkOut, availabilityMutation.mutate]);

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

  const nightPriceCents = useMemo((): Record<string, number> | null => {
    if (!checkIn || !checkOut || !smoobuPropertyId) return null;
    if (!availabilityMutation.data) return null;
    if (
      !availabilityMutation.data.availableApartments.includes(smoobuPropertyId)
    )
      return null;

    const dates = getDateRange(formatDate(checkIn), formatDate(checkOut));
    const result: Record<string, number> = {};
    for (const date of dates) {
      const rate = rateMap[date];
      if (rate?.price == null) return null;
      result[date] = toCents(rate.price);
    }
    return result;
  }, [checkIn, checkOut, smoobuPropertyId, rateMap, availabilityMutation.data]);

  const totalPriceCents = useMemo(
    () =>
      nightPriceCents
        ? Object.values(nightPriceCents).reduce((sum, c) => sum + c, 0)
        : null,
    [nightPriceCents]
  );

  return {
    currentMonth,
    checkIn,
    checkOut,
    rateMap,
    currency,
    ratesLoading: ratesQuery.isLoading,
    availabilityResult: availabilityMutation.data ?? null,
    availabilityLoading: availabilityMutation.isPending || pendingUrlCheck,
    availabilityError: availabilityMutation.error,
    isCalendarOpen,
    setCalendarOpen,
    isAvailable,
    nightPriceCents,
    totalPriceCents,
    goNextMonth,
    goPrevMonth,
    handleDateClick,
    clearDates,
  };
}
