import { useStore } from "@nanostores/react";
import { bookingStore, setGuests } from "../store/bookingStore";

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
      <div className="relative">
        <select
          id="guest-select"
          value={$booking.guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full px-4 py-3.5 bg-secondary rounded-xl text-foreground border border-border/50 focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
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
        {/* Custom dropdown arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            aria-hidden="true"
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
