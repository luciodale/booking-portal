import { fetchBookings } from "@/features/public/bookings/api/fetchBookings";
import type { BookingListItem } from "@/features/public/bookings/api/fetchBookings";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

export function BookingsHistoryView() {
  return (
    <QueryClientProvider client={queryClient}>
      <BookingsHistoryInner />
    </QueryClientProvider>
  );
}

function BookingsHistoryInner() {
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">Failed to load bookings</p>
      </div>
    );
  }

  if (!bookings?.length) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-foreground mb-2">
          No bookings yet
        </h2>
        <p className="text-muted-foreground mb-6">
          Your booking history will appear here.
        </p>
        <a
          href="/elite"
          className="inline-block py-2 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Browse Properties
        </a>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookings.filter((b) => b.checkIn >= today);
  const past = bookings.filter((b) => b.checkIn < today);

  return (
    <div className="space-y-10">
      {upcoming.length > 0 && (
        <BookingSection title="Upcoming" bookings={upcoming} />
      )}
      {past.length > 0 && <BookingSection title="Past" bookings={past} />}
    </div>
  );
}

function BookingSection({
  title,
  bookings,
}: { title: string; bookings: BookingListItem[] }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">{title}</h2>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: BookingListItem }) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400",
    confirmed: "bg-green-500/10 text-green-400",
    cancelled: "bg-red-500/10 text-red-400",
    completed: "bg-blue-500/10 text-blue-400",
  };

  return (
    <a
      href={`/bookings/${booking.id}`}
      className="block p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h3 className="text-foreground font-semibold truncate">
            {booking.propertyTitle}
          </h3>
          <p className="text-sm text-muted-foreground">
            {booking.checkIn} &rarr; {booking.checkOut} &middot;{" "}
            {booking.nights} night{booking.nights !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right shrink-0 space-y-1">
          <div className="text-foreground font-bold">
            {(booking.totalPrice / 100).toFixed(2)}{" "}
            {booking.currency.toUpperCase()}
          </div>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status] ?? ""}`}
          >
            {booking.status}
          </span>
        </div>
      </div>
    </a>
  );
}
