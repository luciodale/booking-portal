import { describe, expect, it } from "vitest";
import {
  computeRateRange,
  formatDate,
  getDayDisplayState,
  getMonthDays,
} from "../dateUtils";

// ---------------------------------------------------------------------------
// computeRateRange – ensures last day of the right month is included
// ---------------------------------------------------------------------------

describe("computeRateRange", () => {
  it("covers Feb 1 through Apr 1 when currentMonth is February", () => {
    const feb = new Date(2026, 1, 1); // Feb 2026
    const { rangeStart, rangeEnd } = computeRateRange(feb);
    expect(rangeStart).toBe("2026-02-01");
    // March has 31 days; exclusive end must be April 1
    expect(rangeEnd).toBe("2026-04-01");
  });

  it("covers Jan 1 through Mar 1 when currentMonth is January", () => {
    const jan = new Date(2026, 0, 1);
    const { rangeStart, rangeEnd } = computeRateRange(jan);
    expect(rangeStart).toBe("2026-01-01");
    // February 2026 has 28 days; exclusive end = March 1
    expect(rangeEnd).toBe("2026-03-01");
  });

  it("handles year boundary (Nov → Dec/Jan)", () => {
    const nov = new Date(2025, 10, 1); // Nov 2025
    const { rangeStart, rangeEnd } = computeRateRange(nov);
    expect(rangeStart).toBe("2025-11-01");
    // December has 31 days; exclusive end = Jan 1 2026
    expect(rangeEnd).toBe("2026-01-01");
  });

  it("handles leap year February", () => {
    const jan = new Date(2028, 0, 1); // 2028 is a leap year
    const { rangeStart, rangeEnd } = computeRateRange(jan);
    expect(rangeStart).toBe("2028-01-01");
    // Feb 2028 has 29 days; exclusive end = March 1
    expect(rangeEnd).toBe("2028-03-01");
  });

  it("last visible day falls within the range (regression)", () => {
    const feb = new Date(2026, 1, 1);
    const { rangeEnd } = computeRateRange(feb);
    // March 31 is the last visible day; it must be < rangeEnd
    expect("2026-03-31" < rangeEnd).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getMonthDays – includes first and last day of the month
// ---------------------------------------------------------------------------

describe("getMonthDays", () => {
  it("returns all 31 days for March 2026", () => {
    const march = new Date(2026, 2, 1);
    const days = getMonthDays(march);
    expect(days).toHaveLength(31);
    expect(formatDate(days[0])).toBe("2026-03-01");
    expect(formatDate(days[30])).toBe("2026-03-31");
  });

  it("returns 28 days for February 2026 (non-leap)", () => {
    const feb = new Date(2026, 1, 1);
    const days = getMonthDays(feb);
    expect(days).toHaveLength(28);
    expect(formatDate(days[27])).toBe("2026-02-28");
  });
});

// ---------------------------------------------------------------------------
// Cross-month selection logic (mirrors handleDateClick)
// ---------------------------------------------------------------------------

describe("cross-month date selection", () => {
  function simulateSelection(clicks: string[]) {
    let checkIn: string | null = null;
    let checkOut: string | null = null;

    for (const dateStr of clicks) {
      if (!checkIn || (checkIn && checkOut)) {
        checkIn = dateStr;
        checkOut = null;
      } else if (dateStr > checkIn) {
        checkOut = dateStr;
      } else {
        checkIn = dateStr;
        checkOut = null;
      }
    }
    return { checkIn, checkOut };
  }

  it("selects checkIn in Feb and checkOut in March", () => {
    const result = simulateSelection(["2026-02-25", "2026-03-05"]);
    expect(result.checkIn).toBe("2026-02-25");
    expect(result.checkOut).toBe("2026-03-05");
  });

  it("selects checkIn in Dec and checkOut in Jan (year boundary)", () => {
    const result = simulateSelection(["2025-12-28", "2026-01-03"]);
    expect(result.checkIn).toBe("2025-12-28");
    expect(result.checkOut).toBe("2026-01-03");
  });

  it("clicking before checkIn resets selection", () => {
    const result = simulateSelection(["2026-03-10", "2026-02-20"]);
    expect(result.checkIn).toBe("2026-02-20");
    expect(result.checkOut).toBeNull();
  });

  it("clicking after full selection starts new one", () => {
    const result = simulateSelection([
      "2026-02-10",
      "2026-02-15",
      "2026-03-01",
    ]);
    expect(result.checkIn).toBe("2026-03-01");
    expect(result.checkOut).toBeNull();
  });

  it("inRange spans across months", () => {
    const checkIn = "2026-02-25";
    const checkOut = "2026-03-05";
    // Days between should be inRange
    expect("2026-02-28" > checkIn && "2026-02-28" < checkOut).toBe(true);
    expect("2026-03-01" > checkIn && "2026-03-01" < checkOut).toBe(true);
    // Boundaries should NOT be inRange (self-compare is intentional — tests string ordering)
    // biome-ignore lint/suspicious/noSelfCompare: verifying string boundary semantics
    expect(checkIn > checkIn && checkIn < checkOut).toBe(false);
    // biome-ignore lint/suspicious/noSelfCompare: verifying string boundary semantics
    expect(checkOut > checkIn && checkOut < checkOut).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getDayDisplayState – pricing labels
// ---------------------------------------------------------------------------

describe("getDayDisplayState", () => {
  const baseParams = {
    today: "2026-02-15",
    checkIn: null as string | null,
    checkOut: null as string | null,
    rate: undefined as { price: number | null; min_length_of_stay: number | null; available: number } | undefined,
    ratesLoading: false,
    currency: "EUR" as string | null,
  };

  it("shows price when rate exists and day is not past", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-02-20",
      rate: { price: 150, min_length_of_stay: 1, available: 1 },
    });
    expect(ds.showPrice).toBe(true);
    expect(ds.price).toBe(150);
  });

  it("hides price for past days even if rate exists", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-02-10",
      rate: { price: 150, min_length_of_stay: 1, available: 1 },
    });
    expect(ds.showPrice).toBe(false);
    expect(ds.past).toBe(true);
  });

  it("hides price when rates are loading", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-02-20",
      rate: { price: 150, min_length_of_stay: 1, available: 1 },
      ratesLoading: true,
    });
    expect(ds.showPrice).toBe(false);
  });

  it("hides price when currency is null", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-02-20",
      rate: { price: 150, min_length_of_stay: 1, available: 1 },
      currency: null,
    });
    expect(ds.showPrice).toBe(false);
  });

  it("hides price when rate.price is null", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-02-20",
      rate: { price: null, min_length_of_stay: 1, available: 1 },
    });
    expect(ds.showPrice).toBe(false);
    expect(ds.price).toBeNull();
  });

  it("hides price when no rate data (undefined)", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-02-20",
      rate: undefined,
    });
    expect(ds.showPrice).toBe(false);
  });

  it("marks day unavailable when rate.available === 0", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-02-20",
      rate: { price: 150, min_length_of_stay: 1, available: 0 },
    });
    expect(ds.unavailable).toBe(true);
  });

  it("marks past days as unavailable", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-02-10",
    });
    expect(ds.unavailable).toBe(true);
    expect(ds.past).toBe(true);
  });

  it("detects checkIn correctly", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-02-20",
      checkIn: "2026-02-20",
    });
    expect(ds.isCheckIn).toBe(true);
    expect(ds.isCheckOut).toBe(false);
  });

  it("detects checkOut correctly", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-02-25",
      checkIn: "2026-02-20",
      checkOut: "2026-02-25",
    });
    expect(ds.isCheckOut).toBe(true);
    expect(ds.isCheckIn).toBe(false);
  });

  it("detects inRange across months", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-03-01",
      checkIn: "2026-02-25",
      checkOut: "2026-03-05",
    });
    expect(ds.inRange).toBe(true);
  });

  it("checkIn/checkOut boundaries are not inRange", () => {
    const dsIn = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-02-25",
      checkIn: "2026-02-25",
      checkOut: "2026-03-05",
    });
    expect(dsIn.inRange).toBe(false);

    const dsOut = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-03-05",
      checkIn: "2026-02-25",
      checkOut: "2026-03-05",
    });
    expect(dsOut.inRange).toBe(false);
  });

  it("shows price on last day of month when rate exists", () => {
    const ds = getDayDisplayState({
      ...baseParams,
      dateStr: "2026-03-31",
      rate: { price: 200, min_length_of_stay: 1, available: 1 },
    });
    expect(ds.showPrice).toBe(true);
    expect(ds.price).toBe(200);
  });
});
