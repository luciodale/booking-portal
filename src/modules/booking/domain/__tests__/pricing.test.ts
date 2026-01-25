/**
 * Unit tests for pricing engine
 * Verifies breakdown calculations are precise and sum correctly
 */

import { describe, expect, it } from "vitest";
import type { BookingContext } from "../pricing";
import {
  applyChannelMarkup,
  calculatePriceBreakdown,
  getNightlyPriceForDate,
} from "../pricing";

describe("pricing engine", () => {
  const mockContext: BookingContext = {
    assetId: "test-asset",
    pricingModel: "per_night",
    basePrice: 10000, // €100
    cleaningFee: 2500, // €25
    currency: "eur",
    maxGuests: 4,
    minNights: 1,
    pricingRules: [],
  };

  describe("getNightlyPriceForDate", () => {
    it("returns base price when no rules apply", () => {
      const date = new Date("2024-01-15T00:00:00.000Z");
      const result = getNightlyPriceForDate(date, mockContext);

      expect(result.price).toBe(10000);
      expect(result.appliedRule).toBeNull();
    });

    it("applies pricing rule multiplier correctly", () => {
      const contextWithRule: BookingContext = {
        ...mockContext,
        pricingRules: [
          {
            id: "rule-1",
            assetId: "test-asset",
            name: "Summer Peak",
            startDate: "2024-07-01",
            endDate: "2024-08-31",
            multiplier: 150, // 1.5x
            minNights: null,
            priority: 0,
            active: true,
            createdAt: null,
          },
        ],
      };

      const date = new Date("2024-07-15T00:00:00.000Z");
      const result = getNightlyPriceForDate(date, contextWithRule);

      expect(result.price).toBe(15000); // €100 * 1.5 = €150
      expect(result.appliedRule).toBe("Summer Peak");
    });

    it("applies highest priority rule when multiple overlap", () => {
      const contextWithRules: BookingContext = {
        ...mockContext,
        pricingRules: [
          {
            id: "rule-1",
            assetId: "test-asset",
            name: "Summer",
            startDate: "2024-07-01",
            endDate: "2024-08-31",
            multiplier: 150, // 1.5x
            minNights: null,
            priority: 0,
            active: true,
            createdAt: null,
          },
          {
            id: "rule-2",
            assetId: "test-asset",
            name: "Holiday Week",
            startDate: "2024-07-10",
            endDate: "2024-07-20",
            multiplier: 200, // 2x
            minNights: null,
            priority: 10, // Higher priority
            active: true,
            createdAt: null,
          },
        ],
      };

      const date = new Date("2024-07-15T00:00:00.000Z");
      const result = getNightlyPriceForDate(date, contextWithRules);

      expect(result.price).toBe(20000); // Uses 2x multiplier (higher priority)
      expect(result.appliedRule).toBe("Holiday Week");
    });

    it("ignores inactive rules", () => {
      const contextWithInactiveRule: BookingContext = {
        ...mockContext,
        pricingRules: [
          {
            id: "rule-1",
            assetId: "test-asset",
            name: "Disabled Sale",
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            multiplier: 80, // 0.8x
            minNights: null,
            priority: 0,
            active: false, // Inactive
            createdAt: null,
          },
        ],
      };

      const date = new Date("2024-06-15T00:00:00.000Z");
      const result = getNightlyPriceForDate(date, contextWithInactiveRule);

      expect(result.price).toBe(10000); // Base price (rule ignored)
      expect(result.appliedRule).toBeNull();
    });
  });

  describe("calculatePriceBreakdown", () => {
    it("calculates breakdown correctly for single night", () => {
      const startDate = new Date("2024-01-15T00:00:00.000Z");
      const endDate = new Date("2024-01-16T00:00:00.000Z");

      const breakdown = calculatePriceBreakdown(
        startDate,
        endDate,
        2,
        mockContext
      );

      expect(breakdown).not.toBeNull();
      expect(breakdown?.nights).toBe(1);
      expect(breakdown?.baseTotal).toBe(10000); // €100 * 1 night
      expect(breakdown?.cleaningFee).toBe(2500); // €25
      expect(breakdown?.serviceFee).toBe(1500); // 12% of (€100 + €25) = €15
      expect(breakdown?.total).toBe(14000); // €100 + €25 + €15 = €140
    });

    it("calculates breakdown correctly for multiple nights", () => {
      const startDate = new Date("2024-01-15T00:00:00.000Z");
      const endDate = new Date("2024-01-18T00:00:00.000Z"); // 3 nights

      const breakdown = calculatePriceBreakdown(
        startDate,
        endDate,
        2,
        mockContext
      );

      expect(breakdown).not.toBeNull();
      expect(breakdown?.nights).toBe(3);
      expect(breakdown?.baseTotal).toBe(30000); // €100 * 3 nights
      expect(breakdown?.cleaningFee).toBe(2500); // €25 (flat fee)
      expect(breakdown?.serviceFee).toBe(3900); // 12% of (€300 + €25) = €39
      expect(breakdown?.total).toBe(36400); // €300 + €25 + €39 = €364
    });

    it("ensures breakdown components sum to total exactly", () => {
      const startDate = new Date("2024-01-15T00:00:00.000Z");
      const endDate = new Date("2024-01-20T00:00:00.000Z"); // 5 nights

      const breakdown = calculatePriceBreakdown(
        startDate,
        endDate,
        2,
        mockContext
      );

      expect(breakdown).not.toBeNull();
      if (breakdown) {
        const sum =
          breakdown.baseTotal + breakdown.cleaningFee + breakdown.serviceFee;
        expect(sum).toBe(breakdown.total); // Must equal exactly
      }
    });

    it("handles pricing rules across nights", () => {
      const contextWithRule: BookingContext = {
        ...mockContext,
        pricingRules: [
          {
            id: "rule-1",
            assetId: "test-asset",
            name: "Weekend Rate",
            startDate: "2024-01-13",
            endDate: "2024-01-14",
            multiplier: 120, // 1.2x
            minNights: null,
            priority: 0,
            active: true,
            createdAt: null,
          },
        ],
      };

      // Jan 12-15 (3 nights): 12th=base, 13th=1.2x, 14th=1.2x
      const startDate = new Date("2024-01-12T00:00:00.000Z");
      const endDate = new Date("2024-01-15T00:00:00.000Z");

      const breakdown = calculatePriceBreakdown(
        startDate,
        endDate,
        2,
        contextWithRule
      );

      expect(breakdown).not.toBeNull();
      expect(breakdown?.nights).toBe(3);
      // Night 1 (Jan 12): €100
      // Night 2 (Jan 13): €120
      // Night 3 (Jan 14): €120
      // Total: €340
      expect(breakdown?.baseTotal).toBe(34000);
    });

    it("returns null for invalid date range", () => {
      const startDate = new Date("2024-01-15T00:00:00.000Z");
      const endDate = new Date("2024-01-15T00:00:00.000Z"); // Same day

      const breakdown = calculatePriceBreakdown(
        startDate,
        endDate,
        2,
        mockContext
      );

      expect(breakdown).toBeNull();
    });

    it("returns null for missing endDate in per_night model", () => {
      const startDate = new Date("2024-01-15T00:00:00.000Z");
      const breakdown = calculatePriceBreakdown(
        startDate,
        null,
        2,
        mockContext
      );

      expect(breakdown).toBeNull();
    });

    it("handles per_person pricing model", () => {
      const contextPerPerson: BookingContext = {
        ...mockContext,
        pricingModel: "per_person",
        basePrice: 5000, // €50 per person
        cleaningFee: 0,
      };

      const startDate = new Date("2024-01-15T00:00:00.000Z");
      const breakdown = calculatePriceBreakdown(
        startDate,
        null,
        3,
        contextPerPerson
      );

      expect(breakdown).not.toBeNull();
      expect(breakdown?.nights).toBe(1);
      expect(breakdown?.baseTotal).toBe(15000); // €50 * 3 guests
      expect(breakdown?.cleaningFee).toBe(0);
      expect(breakdown?.serviceFee).toBe(1800); // 12% of €150
      expect(breakdown?.total).toBe(16800); // €150 + €18
    });

    it("handles fixed pricing model", () => {
      const contextFixed: BookingContext = {
        ...mockContext,
        pricingModel: "fixed",
        basePrice: 25000, // €250 fixed
        cleaningFee: 0,
      };

      const startDate = new Date("2024-01-15T00:00:00.000Z");
      const breakdown = calculatePriceBreakdown(
        startDate,
        null,
        1,
        contextFixed
      );

      expect(breakdown).not.toBeNull();
      expect(breakdown?.nights).toBe(1);
      expect(breakdown?.baseTotal).toBe(25000); // €250 fixed
      expect(breakdown?.cleaningFee).toBe(0);
      expect(breakdown?.serviceFee).toBe(3000); // 12% of €250
      expect(breakdown?.total).toBe(28000); // €250 + €30
    });
  });

  describe("applyChannelMarkup", () => {
    it("applies markup to breakdown and maintains sum integrity", () => {
      const baseBreakdown = {
        baseTotal: 10000, // €100
        cleaningFee: 2500, // €25
        serviceFee: 1500, // €15
        total: 14000, // €140
        nights: 1,
        appliedRules: [],
        currency: "eur",
      };

      // Apply 15% Airbnb markup
      const withMarkup = applyChannelMarkup(baseBreakdown, 15);

      expect(withMarkup.baseTotal).toBe(11500); // €100 * 1.15 = €115
      expect(withMarkup.cleaningFee).toBe(2500); // Unchanged
      expect(withMarkup.serviceFee).toBe(1725); // €15 * 1.15 = €17.25

      // Verify sum integrity
      const sum =
        withMarkup.baseTotal + withMarkup.cleaningFee + withMarkup.serviceFee;
      expect(sum).toBe(withMarkup.total);
    });

    it("handles zero markup", () => {
      const baseBreakdown = {
        baseTotal: 10000,
        cleaningFee: 2500,
        serviceFee: 1500,
        total: 14000,
        nights: 1,
        appliedRules: [],
        currency: "eur",
      };

      const unchanged = applyChannelMarkup(baseBreakdown, 0);

      expect(unchanged.baseTotal).toBe(10000);
      expect(unchanged.cleaningFee).toBe(2500);
      expect(unchanged.serviceFee).toBe(1500);
      expect(unchanged.total).toBe(14000);
    });

    it("handles negative markup (discount)", () => {
      const baseBreakdown = {
        baseTotal: 10000,
        cleaningFee: 2500,
        serviceFee: 1500,
        total: 14000,
        nights: 1,
        appliedRules: [],
        currency: "eur",
      };

      const discounted = applyChannelMarkup(baseBreakdown, -10); // 10% discount

      expect(discounted.baseTotal).toBe(9000); // €100 * 0.9 = €90
      expect(discounted.cleaningFee).toBe(2500); // Unchanged
      expect(discounted.serviceFee).toBe(1350); // €15 * 0.9 = €13.50

      // Verify sum integrity
      const sum =
        discounted.baseTotal + discounted.cleaningFee + discounted.serviceFee;
      expect(sum).toBe(discounted.total);
    });
  });

  describe("precision edge cases", () => {
    it("handles odd numbers that could cause rounding issues", () => {
      const oddContext: BookingContext = {
        ...mockContext,
        basePrice: 3333, // €33.33
        cleaningFee: 1111, // €11.11
      };

      const startDate = new Date("2024-01-15T00:00:00.000Z");
      const endDate = new Date("2024-01-18T00:00:00.000Z"); // 3 nights

      const breakdown = calculatePriceBreakdown(
        startDate,
        endDate,
        2,
        oddContext
      );

      expect(breakdown).not.toBeNull();
      if (breakdown) {
        // Verify sum integrity even with odd numbers
        const sum =
          breakdown.baseTotal + breakdown.cleaningFee + breakdown.serviceFee;
        expect(sum).toBe(breakdown.total);
      }
    });

    it("handles large price values without precision loss", () => {
      const luxuryContext: BookingContext = {
        ...mockContext,
        basePrice: 100000000, // €1,000,000 per night
        cleaningFee: 5000000, // €50,000
      };

      const startDate = new Date("2024-01-15T00:00:00.000Z");
      const endDate = new Date("2024-01-16T00:00:00.000Z");

      const breakdown = calculatePriceBreakdown(
        startDate,
        endDate,
        2,
        luxuryContext
      );

      expect(breakdown).not.toBeNull();
      if (breakdown) {
        expect(breakdown.baseTotal).toBe(100000000);
        expect(breakdown.cleaningFee).toBe(5000000);
        // Service fee: 12% of €1,050,000 = €126,000
        expect(breakdown.serviceFee).toBe(12600000);

        const sum =
          breakdown.baseTotal + breakdown.cleaningFee + breakdown.serviceFee;
        expect(sum).toBe(breakdown.total);
        expect(breakdown.total).toBe(117600000);
      }
    });
  });
});
