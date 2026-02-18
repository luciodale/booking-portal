import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";
import { stripLocalePrefix } from "@/i18n/locale-path";

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

  const url = new URL(context.request.url);
  const strippedPath = stripLocalePrefix(url.pathname);
  const testUrl = new URL(strippedPath, url.origin);
  const testRequest = new Request(testUrl, context.request);

  if (isProtectedRoute(testRequest)) {
    const { userId, redirectToSignIn } = auth();

    if (!userId) {
      return redirectToSignIn({
        returnBackUrl: url.pathname + url.search,
      });
    }
  }

  return next();
});
