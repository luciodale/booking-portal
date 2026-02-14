import { USE_TEST_MODE } from "@/config";
import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";
import { defineMiddleware, sequence } from "astro:middleware";

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

const envSwap = defineMiddleware((context, next) => {
  if (context.locals.runtime?.env) {
    const env = context.locals.runtime.env;
    if (USE_TEST_MODE) {
      env.CLERK_SECRET_KEY = env.TEST_CLERK_SECRET_KEY;
      env.CLERK_JWT_KEY = env.TEST_CLERK_JWT_KEY;
    } else {
      env.CLERK_SECRET_KEY = env.PROD_CLERK_SECRET_KEY;
      env.CLERK_JWT_KEY = env.PROD_CLERK_JWT_KEY;
    }
  }
  return next();
});

const clerk = clerkMiddleware((auth, context, next) => {
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

export const onRequest = sequence(envSwap, clerk);
