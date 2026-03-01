import { getDateRange } from "@/features/public/booking/domain/computeStayPrice";
import { toCents } from "@/modules/money/money";
import {
  addMonths,
  computeRateRange,
  startOfMonth,
  subMonths,
  toDate,
} from "@/features/public/booking/domain/dateUtils";
import { useBookingDatesFromUrl } from "@/features/public/booking/hooks/useBookingDatesFromUrl";
import { useCalendarAutoClose } from "@/features/public/booking/hooks/useCalendarAutoClose";
import { usePropertyAvailability } from "@/features/public/booking/hooks/usePropertyAvailability";
import { usePropertyRates } from "@/features/public/booking/hooks/usePropertyRates";
import type {
  SmoobuAvailabilityResponse,
  SmoobuRateDay,
} from "@/schemas/smoobu";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useBookingCalendar(
  propertyId: string,
  smoobuPropertyId: number | null,
  guests: number | null
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
    if (checkIn) return startOfMonth(toDate(checkIn));
    return startOfMonth(new Date());
  });

  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [hasCalendarBeenOpened, setHasCalendarBeenOpened] = useState(false);
  const { shouldAutoClose, resetAutoClose } = useCalendarAutoClose();

  // Track whether we're about to fire the URL-based availability check.
  // This lets PriceDisplay show "loading" instead of "select dates" on first render.
  const [pendingUrlCheck, setPendingUrlCheck] = useState(hadDatesFromUrl);

  useEffect(() => {
    if (isCalendarOpen && !hasCalendarBeenOpened) {
      setHasCalendarBeenOpened(true);
    }
  }, [isCalendarOpen, hasCalendarBeenOpened]);

  // Fetch rates after calendar opened OR when dates come from URL
  const { rangeStart, rangeEnd } = computeRateRange(currentMonth);

  const ratesQuery = usePropertyRates({
    propertyId,
    startDate: rangeStart,
    endDate: rangeEnd,
    enabled: (hasCalendarBeenOpened || hadDatesFromUrl) && !!smoobuPropertyId,
  });

  const availabilityMutation = usePropertyAvailability(propertyId);

  // Race-safe availability state: only the latest mutate() call's
  // callbacks fire (TanStack Query guarantee), so stale responses
  // from rapid date changes are automatically discarded.
  const [availData, setAvailData] = useState<SmoobuAvailabilityResponse | null>(
    null
  );
  const [availError, setAvailError] = useState<Error | null>(null);
  const [availLoading, setAvailLoading] = useState(false);

  function resetAvailability() {
    availabilityMutation.reset();
    setAvailData(null);
    setAvailError(null);
    setAvailLoading(false);
  }

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
    setAvailLoading(true);
    availabilityMutation.mutate(
      { arrivalDate: checkIn, departureDate: checkOut, guests: guests ?? undefined },
      {
        onSuccess: (data) => {
          setAvailData(data);
          setAvailLoading(false);
        },
        onError: (error) => {
          setAvailError(error);
          setAvailLoading(false);
        },
      }
    );
  }, [pendingUrlCheck, checkIn, checkOut, guests, availabilityMutation.mutate]);

  // Re-check availability when guest count changes with dates already selected
  const prevGuestsRef = useRef(guests);
  useEffect(() => {
    if (prevGuestsRef.current === guests) return;
    prevGuestsRef.current = guests;
    if (!checkIn || !checkOut) return;
    setAvailLoading(true);
    availabilityMutation.mutate(
      { arrivalDate: checkIn, departureDate: checkOut, guests: guests ?? undefined },
      {
        onSuccess: (data) => {
          setAvailData(data);
          setAvailLoading(false);
        },
        onError: (error) => {
          setAvailError(error);
          setAvailLoading(false);
        },
      }
    );
  }, [guests, checkIn, checkOut, availabilityMutation.mutate]);

  const goNextMonth = useCallback(() => {
    setCurrentMonth((m) => addMonths(m, 1));
  }, []);

  const goPrevMonth = useCallback(() => {
    setCurrentMonth((m) => subMonths(m, 1));
  }, []);

  function handleDateClick(dateStr: string) {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut(null);
      resetAvailability();
    } else if (dateStr > checkIn) {
      setCheckOut(dateStr);
      if (shouldAutoClose()) {
        setCalendarOpen(false);
      }
      setAvailLoading(true);
      availabilityMutation.mutate(
        { arrivalDate: checkIn, departureDate: dateStr, guests: guests ?? undefined },
        {
          onSuccess: (data) => {
            setAvailData(data);
            setAvailLoading(false);
          },
          onError: (error) => {
            setAvailError(error);
            setAvailLoading(false);
          },
        }
      );
    } else {
      setCheckIn(dateStr);
      setCheckOut(null);
      resetAvailability();
    }
  }

  function confirmCalendar() {
    setCalendarOpen(false);
  }

  function retryDates() {
    clearUrlDates();
    resetAutoClose();
    setCalendarOpen(true);
    resetAvailability();
  }

  const isAvailable =
    !!availData &&
    !!smoobuPropertyId &&
    availData.availableApartments.includes(smoobuPropertyId);

  const nightPriceCents = useMemo((): Record<string, number> | null => {
    if (!checkIn || !checkOut || !smoobuPropertyId) return null;
    if (!availData) return null;
    if (!availData.availableApartments.includes(smoobuPropertyId)) return null;

    const dates = getDateRange(checkIn, checkOut);
    const result: Record<string, number> = {};
    for (const date of dates) {
      const rate = rateMap[date];
      if (rate?.price == null) return null;
      result[date] = toCents(rate.price);
    }
    return result;
  }, [checkIn, checkOut, smoobuPropertyId, rateMap, availData]);

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
    availabilityResult: availData,
    availabilityLoading: availLoading || pendingUrlCheck,
    availabilityError: availError,
    isCalendarOpen,
    setCalendarOpen,
    isAvailable,
    nightPriceCents,
    totalPriceCents,
    goNextMonth,
    goPrevMonth,
    handleDateClick,
    confirmCalendar,
    retryDates,
  };
}
