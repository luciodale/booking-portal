import { createExperienceCheckoutSession } from "@/features/public/booking/api/createExperienceCheckoutSession";
import { buildSignInRedirect } from "@/modules/auth/redirect";
import { useState } from "react";
import { toast } from "sonner";

type ExperienceGuestInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  guestNote?: string;
};

export function useExperienceCheckout(params: {
  experienceId: string;
  selectedDate: string | null;
  participants: number;
  currency: string;
  isSignedIn: boolean | undefined;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitBooking(data: ExperienceGuestInput) {
    if (!params.isSignedIn) {
      window.location.href = buildSignInRedirect();
      return;
    }

    if (!params.selectedDate) {
      toast.error("Please select a date first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createExperienceCheckoutSession({
        experienceId: params.experienceId,
        bookingDate: params.selectedDate,
        participants: params.participants,
        currency: params.currency,
        guestInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          guestNote: data.guestNote,
        },
      });
      window.location.href = result.url;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something didn't work. Please try again or contact the host."
      );
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, submitBooking };
}
