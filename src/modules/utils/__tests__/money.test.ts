/**
 * Unit tests for monetary calculation utilities
 * Verifies decimal.js-light provides precise financial calculations
 */

import Decimal from "decimal.js-light";
import { describe, expect, it } from "vitest";
import {
  applyMultiplier,
  applyPercentage,
  formatEuros,
  fromCents,
  percentageOf,
  toCents,
} from "../money";

describe("money utilities", () => {
  describe("fromCents / toCents", () => {
    it("converts cents to Decimal and back", () => {
      const cents = 2500;
      const decimal = fromCents(cents);
      expect(decimal).toBeInstanceOf(Decimal);
      expect(toCents(decimal)).toBe(2500);
    });

    it("rounds correctly on conversion", () => {
      const decimal = new Decimal(2500.4);
      expect(toCents(decimal)).toBe(2500); // Rounds down

      const decimal2 = new Decimal(2500.5);
      expect(toCents(decimal2)).toBe(2501); // Rounds up (ROUND_HALF_UP)

      const decimal3 = new Decimal(2500.6);
      expect(toCents(decimal3)).toBe(2501); // Rounds up
    });
  });

  describe("formatEuros", () => {
    it("formats cents as EUR string with 2 decimals", () => {
      expect(formatEuros(2500)).toBe("25.00");
      expect(formatEuros(100)).toBe("1.00");
      expect(formatEuros(0)).toBe("0.00");
      expect(formatEuros(12345)).toBe("123.45");
    });

    it("handles odd cent values", () => {
      expect(formatEuros(999)).toBe("9.99");
      expect(formatEuros(1001)).toBe("10.01");
    });
  });

  describe("applyPercentage", () => {
    it("applies positive percentage markup", () => {
      // 100 EUR + 20% = 120 EUR
      const result = applyPercentage(10000, 20);
      expect(toCents(result)).toBe(12000);
    });

    it("applies negative percentage discount", () => {
      // 100 EUR - 10% = 90 EUR
      const result = applyPercentage(10000, -10);
      expect(toCents(result)).toBe(9000);
    });

    it("handles zero percentage", () => {
      const result = applyPercentage(10000, 0);
      expect(toCents(result)).toBe(10000);
    });

    it("handles fractional percentages precisely", () => {
      // 100 EUR + 12.5% = 112.50 EUR
      const result = applyPercentage(10000, 12.5);
      expect(toCents(result)).toBe(11250);
    });
  });

  describe("percentageOf", () => {
    it("calculates percentage of amount", () => {
      // 12% of 100 EUR = 12 EUR
      const result = percentageOf(10000, 12);
      expect(toCents(result)).toBe(1200);
    });

    it("handles fractional percentages", () => {
      // 5.5% of 200 EUR = 11 EUR
      const result = percentageOf(20000, 5.5);
      expect(toCents(result)).toBe(1100);
    });

    it("handles zero percentage", () => {
      const result = percentageOf(10000, 0);
      expect(toCents(result)).toBe(0);
    });
  });

  describe("applyMultiplier", () => {
    it("applies multiplier stored as integer", () => {
      // 100 EUR * 1.5x (multiplier=150)
      const result = applyMultiplier(10000, 150);
      expect(toCents(result)).toBe(15000);
    });

    it("handles 1x multiplier", () => {
      // 100 EUR * 1x (multiplier=100)
      const result = applyMultiplier(10000, 100);
      expect(toCents(result)).toBe(10000);
    });

    it("handles sub-1x multiplier (discount)", () => {
      // 100 EUR * 0.8x (multiplier=80)
      const result = applyMultiplier(10000, 80);
      expect(toCents(result)).toBe(8000);
    });

    it("avoids floating-point precision errors", () => {
      // This would fail with native JS: 10000 * 0.29 = 2900.0000000000005
      // With multiplier=29 representing 0.29x
      const result = applyMultiplier(10000, 29);
      expect(toCents(result)).toBe(2900);
    });
  });

  describe("precision guarantees", () => {
    it("avoids the 0.1 + 0.2 problem", () => {
      // Classic JS bug: 0.1 + 0.2 !== 0.3
      const a = new Decimal(0.1);
      const b = new Decimal(0.2);
      const sum = a.plus(b);
      expect(sum.toString()).toBe("0.3"); // Exact!
    });

    it("handles complex multi-step calculations precisely", () => {
      // Scenario: €100 base, +20% markup, +12% service fee
      const base = fromCents(10000);
      const withMarkup = base.times(1.2);
      const serviceFee = withMarkup.times(0.12);
      const total = withMarkup.plus(serviceFee);

      expect(toCents(withMarkup)).toBe(12000); // €120
      expect(toCents(serviceFee)).toBe(1440); // €14.40
      expect(toCents(total)).toBe(13440); // €134.40
    });

    it("ensures breakdown components sum to total", () => {
      // Base: €100, Cleaning: €25, Service fee: 12%
      const base = fromCents(10000);
      const cleaning = fromCents(2500);
      const subtotal = base.plus(cleaning);
      const serviceFee = subtotal.times(0.12);

      // Round each component
      const baseRounded = toCents(base);
      const cleaningRounded = toCents(cleaning);
      const serviceFeeRounded = toCents(serviceFee);
      const total = baseRounded + cleaningRounded + serviceFeeRounded;

      expect(baseRounded).toBe(10000);
      expect(cleaningRounded).toBe(2500);
      expect(serviceFeeRounded).toBe(1500); // 12% of €125
      expect(total).toBe(14000); // Sum matches exactly
    });
  });

  describe("rounding behavior", () => {
    it("uses ROUND_HALF_UP for 0.5", () => {
      const decimal = new Decimal(2.5);
      expect(toCents(decimal.times(100))).toBe(250); // 2.5 rounds to 3, * 100 = 250? No wait...
      
      // More direct test
      expect(toCents(new Decimal(100.5))).toBe(101); // Rounds up
      expect(toCents(new Decimal(100.4))).toBe(100); // Rounds down
    });

    it("handles edge cases near zero", () => {
      expect(toCents(new Decimal(0.4))).toBe(0);
      expect(toCents(new Decimal(0.5))).toBe(1);
      expect(toCents(new Decimal(-0.4))).toBe(0);
      expect(toCents(new Decimal(-0.5))).toBe(-1); // Negative rounds away from zero
    });
  });
});

