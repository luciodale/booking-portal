type CheckoutSessionParams = {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  currency: string;
  totalPrice: number;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    adults: number;
    children: number;
    guestNote?: string;
  };
};

type CheckoutSessionResponse = {
  url: string;
};

export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSessionResponse> {
  const response = await fetch("/api/checkout", {
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
