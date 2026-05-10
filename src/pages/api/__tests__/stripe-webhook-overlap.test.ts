import { describe, expect, test } from "vitest";

type Booking = {
  id: string;
  assetId: string;
  status: string;
  checkIn: string;
  checkOut: string;
};

function findOverlap(
  existing: Booking[],
  propertyId: string,
  checkIn: string,
  checkOut: string
): Booking | undefined {
  return existing.find(
    (b) =>
      b.assetId === propertyId &&
      b.status === "confirmed" &&
      b.checkIn < checkOut &&
      b.checkOut > checkIn
  );
}

function parseMetaCents(meta: Record<string, string>, key: string): number {
  const val = Number(meta[key]);
  if (!Number.isFinite(val)) {
    throw new Error(`Invalid or missing metadata value for "${key}"`);
  }
  return val;
}

describe("booking overlap detection", () => {
  const confirmed: Booking = {
    id: "b-1",
    assetId: "prop-1",
    status: "confirmed",
    checkIn: "2025-07-05",
    checkOut: "2025-07-10",
  };

  test("detects full overlap", () => {
    const overlap = findOverlap([confirmed], "prop-1", "2025-07-06", "2025-07-09");
    expect(overlap).toBeDefined();
  });

  test("detects partial overlap at start", () => {
    const overlap = findOverlap([confirmed], "prop-1", "2025-07-03", "2025-07-07");
    expect(overlap).toBeDefined();
  });

  test("detects partial overlap at end", () => {
    const overlap = findOverlap([confirmed], "prop-1", "2025-07-08", "2025-07-12");
    expect(overlap).toBeDefined();
  });

  test("detects encompassing overlap", () => {
    const overlap = findOverlap([confirmed], "prop-1", "2025-07-01", "2025-07-15");
    expect(overlap).toBeDefined();
  });

  test("no overlap when checkout equals existing checkIn (same-day turnover)", () => {
    const overlap = findOverlap([confirmed], "prop-1", "2025-07-01", "2025-07-05");
    expect(overlap).toBeUndefined();
  });

  test("no overlap when checkIn equals existing checkOut (same-day turnover)", () => {
    const overlap = findOverlap([confirmed], "prop-1", "2025-07-10", "2025-07-15");
    expect(overlap).toBeUndefined();
  });

  test("no overlap for different property", () => {
    const overlap = findOverlap([confirmed], "prop-2", "2025-07-06", "2025-07-09");
    expect(overlap).toBeUndefined();
  });

  test("ignores cancelled bookings", () => {
    const cancelled: Booking = { ...confirmed, status: "cancelled" };
    const overlap = findOverlap([cancelled], "prop-1", "2025-07-06", "2025-07-09");
    expect(overlap).toBeUndefined();
  });

  test("ignores pending bookings", () => {
    const pending: Booking = { ...confirmed, status: "pending" };
    const overlap = findOverlap([pending], "prop-1", "2025-07-06", "2025-07-09");
    expect(overlap).toBeUndefined();
  });
});

describe("webhook metadata parsing", () => {
  test("parses valid cents values", () => {
    const meta = { totalPriceCents: "15000", nights: "4" };
    expect(parseMetaCents(meta, "totalPriceCents")).toBe(15000);
    expect(parseMetaCents(meta, "nights")).toBe(4);
  });

  test("throws on missing key", () => {
    const meta = { totalPriceCents: "15000" };
    expect(() => parseMetaCents(meta, "missing")).toThrow("Invalid or missing metadata value");
  });

  test("throws on non-numeric value", () => {
    const meta = { totalPriceCents: "abc" };
    expect(() => parseMetaCents(meta, "totalPriceCents")).toThrow("Invalid or missing metadata value");
  });

  test("throws on Infinity", () => {
    const meta = { totalPriceCents: "Infinity" };
    expect(() => parseMetaCents(meta, "totalPriceCents")).toThrow("Invalid or missing metadata value");
  });

  test("handles zero correctly", () => {
    const meta = { extrasCents: "0" };
    expect(parseMetaCents(meta, "extrasCents")).toBe(0);
  });
});
