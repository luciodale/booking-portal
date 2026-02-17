import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isProtectedRoute = createRouteMatcher([
  "/backoffice(.*)",
  "/api/backoffice(.*)",
  "/api/admin(.*)",
  "/api/checkout",
  "/bookings(.*)",
]);

const isWebhookRoute = createRouteMatcher([
  "/api/stripe-webhook",
  "/api/clerk-webhook",
]);

export const onRequest = clerkMiddleware((auth, context, next) => {
  if (isWebhookRoute(context.request)) {
    return next();
  }

  if (isProtectedRoute(context.request)) {
    const { userId, redirectToSignIn } = auth();

    if (!userId) {
      const url = new URL(context.request.url);
      return redirectToSignIn({
        returnBackUrl: url.pathname + url.search,
      });
    }
  }

  return next();
});
