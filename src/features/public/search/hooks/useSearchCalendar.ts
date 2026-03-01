import {
  addMonths,
  formatDate,
  startOfMonth,
  subMonths,
  todayStr,
} from "@/features/public/booking/domain/dateUtils";
import { useCallback, useState } from "react";

export function useSearchCalendar(defaultCheckIn: string, defaultCheckOut: string) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [checkIn, setCheckIn] = useState<string | null>(defaultCheckIn || null);
  const [checkOut, setCheckOut] = useState<string | null>(defaultCheckOut || null);
  const [isOpen, setIsOpen] = useState(false);

  const goPrevMonth = useCallback(() => {
    setCurrentMonth((m) => subMonths(m, 1));
  }, []);

  const goNextMonth = useCallback(() => {
    setCurrentMonth((m) => addMonths(m, 1));
  }, []);

  const handleDateClick = useCallback(
    (dateStr: string) => {
      const today = todayStr();
      if (dateStr < today) return;

      if (!checkIn || (checkIn && checkOut)) {
        setCheckIn(dateStr);
        setCheckOut(null);
      } else if (dateStr > checkIn) {
        setCheckOut(dateStr);
      } else {
        setCheckIn(dateStr);
        setCheckOut(null);
      }
    },
    [checkIn, checkOut],
  );

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    currentMonth,
    checkIn,
    checkOut,
    isOpen,
    setIsOpen,
    goPrevMonth,
    goNextMonth,
    handleDateClick,
    handleConfirm,
    formatDate,
  };
}
