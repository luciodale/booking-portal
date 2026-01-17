/**
 * Booking Store - Context-aware reactive state for booking flow
 * Uses nanostores for cross-framework reactivity (React islands in Astro)
 */
import { atom, computed, map } from "nanostores";
import { toISODateString } from "../../shared/utils/dates";
import {
  type BookingContext,
  type PriceBreakdown,
  calculatePriceBreakdown,
} from "../domain/pricing";
import { createBookingSchema } from "../domain/schema";

// ============================================================================
// State Types
// ============================================================================

export type BookingState = {
  startDate: Date | null;
  endDate: Date | null;
  guests: number;
  context: BookingContext | null;
};

// ============================================================================
// Core Store
// ============================================================================

export const bookingStore = map<BookingState>({
  startDate: null,
  endDate: null,
  guests: 1,
  context: null,
});

// Submission state atoms
export const isSubmitting = atom<boolean>(false);
export const submissionResult = atom<{
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
} | null>(null);

// ============================================================================
// Computed Values (Derived State)
// ============================================================================

/** Number of nights for the booking */
export const totalNights = computed(
  bookingStore,
  ({ startDate, endDate, context }) => {
    if (!startDate || !context) return 0;

    // Tours/Experiences are always 1 day
    if (context.assetType === "tour" || context.assetType === "experience") {
      return 1;
    }

    if (!endDate) return 0;

    const diff = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
);

/** Full price breakdown using the pricing engine */
export const priceBreakdown = computed(
  bookingStore,
  (state): PriceBreakdown | null => {
    if (!state.context || !state.startDate) return null;

    return calculatePriceBreakdown(
      state.startDate,
      state.endDate,
      state.guests,
      state.context
    );
  }
);

// ============================================================================
// Legacy Computed Values (Backward Compatibility)
// ============================================================================

/** Base accommodation cost (for backward compat with PriceBreakdown.tsx) */
export const accommodationCost = computed(priceBreakdown, (breakdown) => {
  return breakdown?.baseTotal ?? 0;
});

/** Cleaning fee (for backward compat) */
export const cleaningFee = computed(priceBreakdown, (breakdown) => {
  return breakdown?.cleaningFee ?? 0;
});

/** Service fee (for backward compat) */
export const serviceFee = computed(priceBreakdown, (breakdown) => {
  return breakdown?.serviceFee ?? 0;
});

/** Total price (for backward compat) */
export const totalPrice = computed(priceBreakdown, (breakdown) => {
  return breakdown?.total ?? 0;
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Initialize the booking context with asset data from the server.
 * This must be called when the booking component mounts.
 */
export function initBookingContext(context: BookingContext) {
  bookingStore.setKey("context", context);
  // Reset booking state when switching contexts
  bookingStore.setKey("startDate", null);
  bookingStore.setKey("endDate", null);
  bookingStore.setKey("guests", 1);
  submissionResult.set(null);
}

/**
 * Set check-in and check-out dates.
 * For tours/experiences, endDate is automatically set to match startDate.
 */
export function setDateRange(start: Date | undefined, end: Date | undefined) {
  bookingStore.setKey("startDate", start ?? null);

  const ctx = bookingStore.get().context;
  if (ctx?.assetType === "tour" || ctx?.assetType === "experience") {
    // Tours are single-day, so endDate matches startDate
    bookingStore.setKey("endDate", start ?? null);
  } else {
    bookingStore.setKey("endDate", end ?? null);
  }
}

/** Set the number of guests (clamped to max) */
export function setGuests(count: number) {
  const maxGuests = bookingStore.get().context?.maxGuests ?? 10;
  bookingStore.setKey("guests", Math.min(Math.max(1, count), maxGuests));
}

/** Reset booking state */
export function resetBooking() {
  bookingStore.setKey("startDate", null);
  bookingStore.setKey("endDate", null);
  bookingStore.setKey("guests", 1);
  submissionResult.set(null);
}

/**
 * Submit the booking to the API.
 * Validates with Zod before sending to provide instant feedback.
 */
export async function submitBooking(): Promise<{
  success: boolean;
  message: string;
}> {
  const state = bookingStore.get();
  const breakdown = priceBreakdown.get();

  if (!state.context) {
    return { success: false, message: "Booking not initialized" };
  }

  if (!state.startDate || !state.endDate) {
    return {
      success: false,
      message: "Please select check-in and check-out dates",
    };
  }

  // Format dates for API
  const payload = {
    assetId: state.context.assetId,
    checkIn: toISODateString(state.startDate),
    checkOut: toISODateString(state.endDate),
    guests: state.guests,
    currency: state.context.currency,
    // Price is for display only - server will recalculate
    clientPrice: breakdown?.total,
  };

  // Validate with Zod (instant feedback)
  const validation = createBookingSchema.safeParse(payload);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0];
    return {
      success: false,
      message: firstError ?? "Invalid booking details",
    };
  }

  isSubmitting.set(true);
  submissionResult.set(null);

  try {
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as {
      success: boolean;
      message: string;
      errors?: Record<string, string[]>;
    };

    const result = {
      success: data.success,
      message: data.message,
      errors: data.errors,
    };

    submissionResult.set(result);
    return result;
  } catch (error) {
    const result = {
      success: false,
      message: "An error occurred. Please try again.",
    };
    submissionResult.set(result);
    return result;
  } finally {
    isSubmitting.set(false);
  }
}

// ============================================================================
// Legacy Exports (Backward Compatibility)
// ============================================================================

/** @deprecated Use initBookingContext instead */
export function initializeBooking(config: {
  pricePerNight: number;
  currency: string;
  propertyId: string;
  propertyTitle: string;
  maxGuests: number;
}) {
  // Convert legacy config to BookingContext
  initBookingContext({
    assetId: config.propertyId,
    assetType: "apartment",
    pricingModel: "per_night",
    basePrice: config.pricePerNight * 100, // Convert to cents
    cleaningFee: 25000, // Legacy hardcoded €250
    currency: config.currency,
    maxGuests: config.maxGuests,
    minNights: 1,
    pricingRules: [],
  });
}
