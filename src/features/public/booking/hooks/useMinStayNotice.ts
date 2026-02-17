import { getMinStayNights } from "@/features/public/booking/domain/minStay";
import type { SmoobuRateDay } from "@/schemas/smoobu";
import { useMemo } from "react";

export function useMinStayNotice(
  rateMap: Record<string, SmoobuRateDay>,
  checkIn: string | null
) {
  const minStayNights = useMemo(
    () => getMinStayNights(rateMap, checkIn),
    [rateMap, checkIn]
  );

  return { minStayNights };
}
