import { cn } from "@/modules/utils/cn";
import {
  bookingStore,
  isSubmitting,
  resetBooking,
  submissionResult,
  submitBooking,
  totalNights,
} from "@/modules/booking/store/bookingStore";
import { useStore } from "@nanostores/react";

/**
 * Reserve button island that handles form submission.
 * Shows loading state and handles API call.
 */
export default function ReserveButton() {
  const $booking = useStore(bookingStore);
  const $nights = useStore(totalNights);
  const $isSubmitting = useStore(isSubmitting);
  const $result = useStore(submissionResult);

  const canSubmit = $nights > 0 && !$isSubmitting;

  const handleClick = async () => {
    if (!canSubmit) return;
    await submitBooking();
  };

  // Success state
  if ($result?.success) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="p-4 rounded-xl bg-success/10 border border-success/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/20">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Booking Confirmed!
              </p>
              <p className="text-sm text-muted-foreground">{$result.message}</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={resetBooking}
          className="w-full btn-secondary py-3"
        >
          Book Another
        </button>
      </div>
    );
  }

  // Error state
  if ($result && !$result.success) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-error/10 border border-error/30">
          <p className="text-sm text-error">{$result.message}</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="w-full btn-primary py-4 text-base"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canSubmit}
      className={cn(
        "w-full btn-primary py-4 text-base relative overflow-hidden",
        !canSubmit && "opacity-50 cursor-not-allowed"
      )}
    >
      {$isSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            aria-hidden="true"
            className="w-5 h-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : $nights === 0 ? (
        "Select Dates to Reserve"
      ) : (
        "Reserve Now"
      )}
    </button>
  );
}
