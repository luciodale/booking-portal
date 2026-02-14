type BookingListItem = {
  id: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string | null;
  propertyTitle: string;
  propertyId: string;
};

export type { BookingListItem };

export async function fetchBookings(): Promise<BookingListItem[]> {
  const response = await fetch("/api/bookings");
  if (!response.ok) throw new Error("Failed to fetch bookings");
  const json = (await response.json()) as { data: BookingListItem[] };
  return json.data;
}
