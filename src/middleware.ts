import { CLERK_PUBLISHABLE_KEY } from "@/config";
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
  if (context.locals.runtime?.env) {
    context.locals.runtime.env.PUBLIC_CLERK_PUBLISHABLE_KEY =
      CLERK_PUBLISHABLE_KEY;
  }

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
