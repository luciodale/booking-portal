import { computeExperienceAdditionalCosts } from "@/features/public/booking/domain/computeAdditionalCosts";
import {
  addMonths,
  startOfMonth,
  subMonths,
  todayStr,
} from "@/features/public/booking/domain/dateUtils";
import type {
  ExperienceAdditionalCost,
  PriceLineItem,
} from "@/features/public/booking/domain/pricingTypes";
import { useExperienceAvailability } from "@/features/public/booking/hooks/useExperienceAvailability";
import { useCallback, useMemo, useState } from "react";

export function useExperienceBooking(params: {
  experienceId: string;
  basePrice: number;
  maxParticipants: number;
  currency: string;
  additionalCosts: ExperienceAdditionalCost[] | null;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [participants, setParticipants] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  );
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const {
    availabilityMap,
    isLoading: availabilityLoading,
    isError: availabilityError,
  } = useExperienceAvailability(params.experienceId, currentMonth);

  const baseTotalCents = params.basePrice * participants;

  const additionalCostItems = useMemo<PriceLineItem[]>(
    () =>
      computeExperienceAdditionalCosts(params.additionalCosts, {
        participants,
        currency: params.currency,
      }),
    [params.additionalCosts, participants, params.currency]
  );

  const additionalTotalCents = useMemo(
    () => additionalCostItems.reduce((sum, item) => sum + item.amountCents, 0),
    [additionalCostItems]
  );

  const totalPriceCents = baseTotalCents + additionalTotalCents;

  const isSelectedDateFull = useMemo(() => {
    if (!selectedDate) return false;
    const avail = availabilityMap[selectedDate];
    return avail != null && avail.bookedParticipants >= params.maxParticipants;
  }, [selectedDate, availabilityMap, params.maxParticipants]);

  function handleDateClick(dateStr: string) {
    const today = todayStr();
    if (dateStr < today) return;
    setSelectedDate(dateStr);
    setCalendarOpen(false);
  }

  const goNextMonth = useCallback(() => {
    setCurrentMonth((m) => addMonths(m, 1));
  }, []);

  const goPrevMonth = useCallback(() => {
    setCurrentMonth((m) => subMonths(m, 1));
  }, []);

  function clearDate() {
    setSelectedDate(null);
  }

  function handleParticipantsChange(value: number) {
    const clamped = Math.max(1, Math.min(value, params.maxParticipants));
    setParticipants(clamped);
  }

  return {
    selectedDate,
    participants,
    baseTotalCents,
    totalPriceCents,
    additionalCostItems,
    currentMonth,
    isCalendarOpen,
    setCalendarOpen,
    availabilityMap,
    availabilityLoading,
    availabilityError,
    isSelectedDateFull,
    handleDateClick,
    goNextMonth,
    goPrevMonth,
    clearDate,
    handleParticipantsChange,
  };
}
