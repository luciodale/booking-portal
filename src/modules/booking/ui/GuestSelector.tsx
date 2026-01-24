import { bookingStore, setGuests } from "@/modules/booking/store/bookingStore";
import { useStore } from "@nanostores/react";

/**
 * Guest selector island that syncs with the booking store.
 */
export default function GuestSelector() {
  const $booking = useStore(bookingStore);

  return (
    <div>
      <label
        htmlFor="guest-select"
        className="block text-sm text-muted-foreground mb-2.5 font-medium"
      >
        Guests
      </label>
      <select
        id="guest-select"
        value={$booking.guests}
        onChange={(e) => setGuests(Number(e.target.value))}
        className="w-full px-4 py-3.5 bg-secondary rounded-xl text-foreground border border-border/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:bg-card-hover"
      >
        {Array.from(
          { length: $booking.context?.maxGuests ?? 2 },
          (_, i) => i + 1
        ).map((count) => (
          <option key={count} value={count}>
            {count} guest{count !== 1 ? "s" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
