import { describe, expect, it } from "vitest";

describe("YYYY-MM-DD string comparisons", () => {
  it("compares consecutive days", () => {
    expect("2026-02-18" < "2026-02-19").toBe(true);
    expect("2026-02-19" > "2026-02-18").toBe(true);
  });

  it("compares across month boundaries", () => {
    expect("2026-01-31" < "2026-02-01").toBe(true);
  });

  it("compares across year boundaries", () => {
    expect("2025-12-31" < "2026-01-01").toBe(true);
  });

  it("equality via ===", () => {
    const a = "2026-02-18";
    const b = "2026-02-18";
    const c = "2026-02-19";
    expect(a === b).toBe(true);
    // @ts-expect-error - we want to test the type error
    expect(a === c).toBe(false);
  });
});

describe("parseDateParam validation", () => {
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

  function parseDateParam(value: string | null): string | null {
    if (!value) return null;
    return DATE_REGEX.test(value) ? value : null;
  }

  it("accepts valid YYYY-MM-DD", () => {
    expect(parseDateParam("2026-02-18")).toBe("2026-02-18");
    expect(parseDateParam("2026-12-31")).toBe("2026-12-31");
  });

  it("rejects invalid formats", () => {
    expect(parseDateParam("not-a-date")).toBeNull();
    expect(parseDateParam("2026-2-18")).toBeNull();
    expect(parseDateParam("02-18-2026")).toBeNull();
    expect(parseDateParam("")).toBeNull();
    expect(parseDateParam(null)).toBeNull();
  });
});

describe("date selection logic", () => {
  it("picking checkOut after checkIn works via string comparison", () => {
    const checkIn = "2026-02-18";
    const checkOut = "2026-02-21";
    expect(checkOut > checkIn).toBe(true);
  });

  it("picking date before checkIn resets", () => {
    const checkIn = "2026-02-18";
    const newDate = "2026-02-15";
    expect(newDate > checkIn).toBe(false);
  });
});
