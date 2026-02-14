/**
 * Toggle this flag to switch between test and production keys
 * for Stripe and Clerk.
 *
 * When true:  STRIPE_TEST_*, CLERK_TEST_*, PUBLIC_CLERK_TEST_* are used.
 * When false: STRIPE_*, CLERK_*, PUBLIC_CLERK_* are used.
 */
export const USE_TEST_MODE = true;

export const CLERK_PUBLISHABLE_KEY = USE_TEST_MODE
  ? "pk_test_ZXF1aXBwZWQtc2hyZXctMTUuY2xlcmsuYWNjb3VudHMuZGV2JA"
  : "pk_live_TODO";
