// Minimum guest total below which checkout is rejected. Avoids cases where
// platform fee + withholding would consume the entire booking, which would
// otherwise produce a negative or zero host payout.
export const MIN_BOOKING_CENTS = 500; // 5.00 EUR
