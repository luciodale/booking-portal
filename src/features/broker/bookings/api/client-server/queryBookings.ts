export type BackofficeBooking = {
  id: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  baseTotal: number;
  additionalCostsCents: number;
  extrasCents: number;
  cityTaxCents: number;
  platformFeeCents: number;
  withholdingTaxCents: number;
  totalPrice: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  guestNote: string | null;
  createdAt: string | null;
  propertyTitle: string;
  propertyId: string;
  guestName: string | null;
  guestEmail: string;
};

export type BackofficeBookingsResponse = {
  bookings: BackofficeBooking[];
  total: number;
};

export async function queryBookings(params?: {
  propertyId?: string;
}): Promise<BackofficeBookingsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.propertyId) searchParams.set("propertyId", params.propertyId);

  const query = searchParams.toString();
  const url = `/api/backoffice/bookings${query ? `?${query}` : ""}`;

  const response = await fetch(url);
  const json = (await response.json()) as {
    success: boolean;
    data?: BackofficeBookingsResponse;
    error?: { message: string };
  };
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch bookings");
  }
  return json.data as BackofficeBookingsResponse;
}
