import { describe, expect, test } from "bun:test";
import { centsToUnit } from "../money";
import { formatPrice } from "@/features/public/booking/domain/dateUtils";
import { formatPriceShort } from "@/modules/ui/calendar/utils/calendar-utils";

describe("formatted display output", () => {
  describe("formatPrice(centsToUnit(cents), 'EUR')", () => {
    const cases: [number, string][] = [
      [2500, "€25"],
      [9999, "€100"],
      [25000, "€250"],
      [150, "€2"],
      [0, "€0"],
    ];

    test.each(cases)("%i cents → %s", (cents, expected) => {
      expect(formatPrice(centsToUnit(cents), "EUR")).toBe(expected);
    });
  });

  describe("formatPriceShort(cents)", () => {
    const cases: [number, string][] = [
      [2500, "€25"],
      [9999, "€100"],
      [25000, "€250"],
      [150, "€2"],
      [0, "€0"],
    ];

    test.each(cases)("%i cents → %s", (cents, expected) => {
      expect(formatPriceShort(cents)).toBe(expected);
    });
  });

  describe("centsToUnit(cents).toFixed(2)", () => {
    const cases: [number, string][] = [
      [2500, "25.00"],
      [9999, "99.99"],
      [1, "0.01"],
    ];

    test.each(cases)("%i cents → %s", (cents, expected) => {
      expect(centsToUnit(cents).toFixed(2)).toBe(expected);
    });
  });
});
