import { checkPropertyAvailability } from "@/features/public/booking/api/checkPropertyAvailability";
import { useMutation } from "@tanstack/react-query";

export function usePropertyAvailability(propertyId: string) {
  return useMutation({
    mutationFn: (params: {
      arrivalDate: string;
      departureDate: string;
      guests?: number;
    }) => checkPropertyAvailability(propertyId, params),
  });
}
