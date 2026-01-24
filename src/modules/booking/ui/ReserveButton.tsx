import {
  bookingStore,
  isSubmitting,
  resetBooking,
  submissionResult,
  submitBooking,
  totalNights,
} from "@/modules/booking/store/bookingStore";
import { cn } from "@/modules/utils/cn";
import { useStore } from "@nanostores/react";
import { Check, Loader2 } from "lucide-react";

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
              <Check className="w-5 h-5 text-success" aria-hidden="true" />
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
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
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
