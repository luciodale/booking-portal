import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isProtectedRoute = createRouteMatcher([
  "/backoffice(.*)",
  "/api/backoffice(.*)",
  "/api/checkout",
  "/bookings(.*)",
]);

const isWebhookRoute = createRouteMatcher(["/api/stripe-webhook"]);

export const onRequest = clerkMiddleware((auth, context, next) => {
  // Skip auth for webhook routes (verified via Stripe signature)
  if (isWebhookRoute(context.request)) {
    return next();
  }

  if (isProtectedRoute(context.request)) {
    const { userId, redirectToSignIn } = auth();

    if (!userId) {
      return redirectToSignIn();
    }
  }

  return next();
});
