import { cancelBooking } from "@/features/broker/bookings/api/client-server/cancelBooking";
import { queryBookings } from "@/features/broker/bookings/api/client-server/queryBookings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBackofficeBookings(params: { propertyId?: string } = {}) {
  return useQuery({
    queryKey: ["backoffice", "bookings", params.propertyId],
    queryFn: () =>
      queryBookings({
        propertyId: params.propertyId || undefined,
      }),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backoffice", "bookings"] });
    },
  });
}
