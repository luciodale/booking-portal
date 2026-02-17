import type { SmoobuRateDay } from "../../../../../schemas/smoobu";
import { describe, expect, it } from "vitest";
import { getMinStayNights } from "../minStay";

function makeRate(overrides: Partial<SmoobuRateDay> = {}): SmoobuRateDay {
  return { price: 100, min_length_of_stay: null, available: 1, ...overrides };
}

describe("getMinStayNights", () => {
  it("returns null when checkIn is null", () => {
    const rateMap = { "2026-03-01": makeRate({ min_length_of_stay: 3 }) };
    expect(getMinStayNights(rateMap, null)).toBeNull();
  });

  it("returns null when checkIn date has no rate entry", () => {
    expect(getMinStayNights({}, "2026-03-01")).toBeNull();
  });

  it("returns null when min_length_of_stay is null", () => {
    const rateMap = { "2026-03-01": makeRate({ min_length_of_stay: null }) };
    expect(getMinStayNights(rateMap, "2026-03-01")).toBeNull();
  });

  it("returns null when min_length_of_stay is 1", () => {
    const rateMap = { "2026-03-01": makeRate({ min_length_of_stay: 1 }) };
    expect(getMinStayNights(rateMap, "2026-03-01")).toBeNull();
  });

  it("returns null when min_length_of_stay is 0", () => {
    const rateMap = { "2026-03-01": makeRate({ min_length_of_stay: 0 }) };
    expect(getMinStayNights(rateMap, "2026-03-01")).toBeNull();
  });

  it("returns the value when min_length_of_stay is 2", () => {
    const rateMap = { "2026-03-01": makeRate({ min_length_of_stay: 2 }) };
    expect(getMinStayNights(rateMap, "2026-03-01")).toBe(2);
  });

  it("returns the value when min_length_of_stay is 7", () => {
    const rateMap = { "2026-03-01": makeRate({ min_length_of_stay: 7 }) };
    expect(getMinStayNights(rateMap, "2026-03-01")).toBe(7);
  });

  it("only looks at the checkIn date, ignores other dates", () => {
    const rateMap = {
      "2026-03-01": makeRate({ min_length_of_stay: null }),
      "2026-03-02": makeRate({ min_length_of_stay: 5 }),
    };
    expect(getMinStayNights(rateMap, "2026-03-01")).toBeNull();
    expect(getMinStayNights(rateMap, "2026-03-02")).toBe(5);
  });
});
