type ExperienceCheckoutParams = {
  experienceId: string;
  bookingDate: string;
  participants: number;
  currency: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    guestNote?: string;
  };
};

type CheckoutSessionResponse = {
  url: string;
};

export async function createExperienceCheckoutSession(
  params: ExperienceCheckoutParams
): Promise<CheckoutSessionResponse> {
  const response = await fetch("/api/experience-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error: string };
    throw new Error(error.error || "Failed to create checkout session");
  }

  return (await response.json()) as CheckoutSessionResponse;
}
