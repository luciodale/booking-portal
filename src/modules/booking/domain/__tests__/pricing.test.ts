/**
 * Unit tests for pricing engine
 * Verifies breakdown calculations are precise and sum correctly
 * Note: Pricing rules are now managed through Smoobu, so the engine uses base prices directly
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
  };

  describe("getNightlyPriceForDate", () => {
    it("returns base price directly (pricing rules now managed via Smoobu)", () => {
      const date = new Date("2024-01-15T00:00:00.000Z");
      const result = getNightlyPriceForDate(date, mockContext);

      expect(result.price).toBe(10000);
      expect(result.appliedRule).toBeNull();
    });

    it("returns base price for any date", () => {
      const summerDate = new Date("2024-07-15T00:00:00.000Z");
      const result = getNightlyPriceForDate(summerDate, mockContext);

      expect(result.price).toBe(10000);
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
      expect(breakdown?.currency).toBe("eur");
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

        const sum =
          breakdown.baseTotal + breakdown.cleaningFee + breakdown.serviceFee;
        expect(sum).toBe(breakdown.total);
      }
    });
  });
});
