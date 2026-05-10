import { describe, expect, it } from "vitest";
import { formatDate, toDate, todayStr } from "../dateUtils";

describe("todayStr", () => {
  it("returns YYYY-MM-DD format", () => {
    const result = todayStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("toDate", () => {
  it("returns correct Date at noon UTC", () => {
    const d = toDate("2026-02-18");
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(1);
    expect(d.getUTCDate()).toBe(18);
    expect(d.getUTCHours()).toBe(12);
  });

  it("produces consistent UTC milliseconds regardless of runtime timezone", () => {
    const d = toDate("2026-06-15");
    expect(d.getTime()).toBe(Date.UTC(2026, 5, 15, 12));
  });
});

describe("formatDate / toDate round-trip", () => {
  it("round-trips correctly", () => {
    expect(formatDate(toDate("2026-02-18"))).toBe("2026-02-18");
    expect(formatDate(toDate("2026-12-31"))).toBe("2026-12-31");
    expect(formatDate(toDate("2026-01-01"))).toBe("2026-01-01");
  });
});
