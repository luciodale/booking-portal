interface CancelBookingResponse {
  bookingId: string;
  status: string;
}

export async function cancelBooking(
  bookingId: string
): Promise<CancelBookingResponse> {
  const response = await fetch(`/api/backoffice/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
  const json = (await response.json()) as {
    success: boolean;
    data?: CancelBookingResponse;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to cancel booking");
  }
  return json.data as CancelBookingResponse;
}
