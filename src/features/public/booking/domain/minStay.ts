import type { SmoobuRateDay } from "@/schemas/smoobu";

export function getMinStayNights(
  rateMap: Record<string, SmoobuRateDay>,
  checkIn: string | null
): number | null {
  if (!checkIn) return null;
  const minStay = rateMap[checkIn]?.min_length_of_stay;
  if (minStay == null || minStay <= 1) return null;
  return minStay;
}
