import {
  addMonths,
  formatDate,
  startOfToday,
  subMonths,
} from "@/features/public/booking/domain/dateUtils";
import { usePropertyRates } from "@/features/public/booking/hooks/usePropertyRates";
import { usePropertyAvailability } from "@/features/public/booking/hooks/usePropertyAvailability";
import type { SmoobuRateDay } from "@/schemas/smoobu";
import { useCallback, useMemo, useState } from "react";
import { endOfMonth, startOfMonth } from "date-fns";

export function useBookingCalendar(
  propertyId: string,
  smoobuPropertyId: number | null
) {
  const [currentMonth, setCurrentMonth] = useState(startOfToday());
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  // Fetch rates for current month + next month
  const rangeStart = formatDate(startOfMonth(currentMonth));
  const rangeEnd = formatDate(endOfMonth(addMonths(currentMonth, 1)));

  const ratesQuery = usePropertyRates({
    propertyId,
    startDate: rangeStart,
    endDate: rangeEnd,
    enabled: !!smoobuPropertyId,
  });

  const availabilityMutation = usePropertyAvailability(propertyId);

  // Extract rate map for the smoobu property
  const rateMap = useMemo((): Record<string, SmoobuRateDay> => {
    if (!ratesQuery.data?.data || !smoobuPropertyId) return {};
    return ratesQuery.data.data[String(smoobuPropertyId)] ?? {};
  }, [ratesQuery.data, smoobuPropertyId]);

  const goNextMonth = useCallback(() => {
    setCurrentMonth((m) => addMonths(m, 1));
  }, []);

  const goPrevMonth = useCallback(() => {
    setCurrentMonth((m) => subMonths(m, 1));
  }, []);

  function handleDateClick(date: Date) {
    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      setCheckIn(date);
      setCheckOut(null);
      availabilityMutation.reset();
    } else {
      // Set check-out
      if (date > checkIn) {
        setCheckOut(date);
        // Trigger availability check
        availabilityMutation.mutate({
          arrivalDate: formatDate(checkIn),
          departureDate: formatDate(date),
        });
      } else {
        // Clicked before check-in — restart
        setCheckIn(date);
        setCheckOut(null);
        availabilityMutation.reset();
      }
    }
  }

  function clearDates() {
    setCheckIn(null);
    setCheckOut(null);
    availabilityMutation.reset();
  }

  return {
    currentMonth,
    checkIn,
    checkOut,
    rateMap,
    ratesLoading: ratesQuery.isLoading,
    availabilityResult: availabilityMutation.data ?? null,
    availabilityLoading: availabilityMutation.isPending,
    availabilityError: availabilityMutation.error,
    goNextMonth,
    goPrevMonth,
    handleDateClick,
    clearDates,
  };
}
