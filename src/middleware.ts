import { stripLocalePrefix } from "@/i18n/locale-path";
import {
  type RateLimitTarget,
  clientIpFromRequest,
  enforceRateLimit,
  tooManyRequestsResponse,
} from "@/modules/rate-limit/rateLimit";
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

const isCheckoutRoute = createRouteMatcher(["/api/checkout"]);
const isUploadRoute = createRouteMatcher([
  "/api/backoffice/upload-images",
  "/api/backoffice/upload-experience-images",
]);
const isSmoobuProxyRoute = createRouteMatcher([
  "/api/smoobu/(.*)",
  "/api/properties/(.*)/rates",
  "/api/properties/(.*)/availability",
  "/api/experiences/(.*)/availability",
]);
const isPublicReadRoute = createRouteMatcher([
  "/api/cities",
  "/api/properties/(.*)",
  "/api/experiences/(.*)",
]);

function pickRateLimitTarget(request: Request): RateLimitTarget | null {
  if (isWebhookRoute(request)) return null; // Webhooks are signed; do not throttle.
  if (isCheckoutRoute(request)) return "checkout";
  if (isUploadRoute(request)) return "upload";
  if (isSmoobuProxyRoute(request)) return "smoobu";
  if (isPublicReadRoute(request)) return "public";
  return null;
}

export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const url = new URL(context.request.url);
  const strippedPath = stripLocalePrefix(url.pathname);
  const testUrl = new URL(strippedPath, url.origin);
  const testRequest = new Request(testUrl, context.request);

  // Rate limit before auth so anon traffic is blocked at the edge.
  const target = pickRateLimitTarget(testRequest);
  if (target) {
    const env = context.locals.runtime?.env;
    if (env) {
      const sessionUserId = auth().userId;
      const key = sessionUserId ?? clientIpFromRequest(context.request);
      const allowed = await enforceRateLimit(env, target, key);
      if (!allowed) return tooManyRequestsResponse();
    }
  }

  if (isWebhookRoute(context.request)) {
    return next();
  }

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
