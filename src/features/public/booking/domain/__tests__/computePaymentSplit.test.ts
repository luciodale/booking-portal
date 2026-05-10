import { describe, expect, test } from "bun:test";
import { computePaymentSplit } from "../computePaymentSplit";

describe("computePaymentSplit", () => {
  test("worked example: €800 nightly + €100 cleaning + €30 city tax", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 80000,
      additionalCostsCents: 10000,
      cityTaxCents: 3000,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.taxableBaseCents).toBe(90000);
    expect(result.platformFeeCents).toBe(9000);
    expect(result.withholdingTaxCents).toBe(18900);
    expect(result.applicationFeeCents).toBe(27900);
    expect(result.guestTotalCents).toBe(93000);
    expect(result.hostPayoutCents).toBe(65100);
  });

  test("Italian property: 10% fee + 21% withholding on taxable base", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 50000,
      additionalCostsCents: 5000,
      cityTaxCents: 0,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.taxableBaseCents).toBe(55000);
    expect(result.platformFeeCents).toBe(5500);
    expect(result.withholdingTaxCents).toBe(11550);
    expect(result.applicationFeeCents).toBe(17050);
    expect(result.guestTotalCents).toBe(55000);
    expect(result.hostPayoutCents).toBe(37950);
  });

  test("non-Italian property: 0% withholding, 10% fee only", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 50000,
      additionalCostsCents: 5000,
      cityTaxCents: 1000,
      feePercent: 10,
      withholdingPercent: 0,
    });

    expect(result.taxableBaseCents).toBe(55000);
    expect(result.platformFeeCents).toBe(5500);
    expect(result.withholdingTaxCents).toBe(0);
    expect(result.applicationFeeCents).toBe(5500);
    expect(result.guestTotalCents).toBe(56000);
    expect(result.hostPayoutCents).toBe(50500);
  });

  test("zero city tax", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 40000,
      additionalCostsCents: 3000,
      cityTaxCents: 0,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.taxableBaseCents).toBe(43000);
    expect(result.guestTotalCents).toBe(43000);
    expect(result.platformFeeCents).toBe(4300);
    expect(result.withholdingTaxCents).toBe(9030);
    expect(result.applicationFeeCents).toBe(13330);
    expect(result.hostPayoutCents).toBe(29670);
  });

  test("city tax excluded from fee/withholding", () => {
    const withCityTax = computePaymentSplit({
      nightlyTotalCents: 40000,
      additionalCostsCents: 3000,
      cityTaxCents: 5000,
      feePercent: 10,
      withholdingPercent: 21,
    });

    const withoutCityTax = computePaymentSplit({
      nightlyTotalCents: 40000,
      additionalCostsCents: 3000,
      cityTaxCents: 0,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(withCityTax.platformFeeCents).toBe(withoutCityTax.platformFeeCents);
    expect(withCityTax.withholdingTaxCents).toBe(
      withoutCityTax.withholdingTaxCents
    );
    expect(withCityTax.applicationFeeCents).toBe(
      withoutCityTax.applicationFeeCents
    );
    expect(withCityTax.guestTotalCents).toBe(
      withoutCityTax.guestTotalCents + 5000
    );
  });

  test("custom fee override: 0% fee", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 50000,
      additionalCostsCents: 5000,
      cityTaxCents: 0,
      feePercent: 0,
      withholdingPercent: 21,
    });

    expect(result.platformFeeCents).toBe(0);
    expect(result.withholdingTaxCents).toBe(11550);
    expect(result.applicationFeeCents).toBe(11550);
  });

  test("custom fee override: 15% fee", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 100000,
      additionalCostsCents: 0,
      cityTaxCents: 0,
      feePercent: 15,
      withholdingPercent: 21,
    });

    expect(result.platformFeeCents).toBe(15000);
    expect(result.withholdingTaxCents).toBe(21000);
    expect(result.applicationFeeCents).toBe(36000);
  });

  test("custom fee override: 100% fee", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 10000,
      additionalCostsCents: 0,
      cityTaxCents: 0,
      feePercent: 100,
      withholdingPercent: 0,
    });

    expect(result.platformFeeCents).toBe(10000);
    expect(result.applicationFeeCents).toBe(10000);
    expect(result.hostPayoutCents).toBe(0);
  });

  test("rounding: fractional cent amounts round correctly", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 33333,
      additionalCostsCents: 0,
      cityTaxCents: 0,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.platformFeeCents).toBe(3333);
    expect(result.withholdingTaxCents).toBe(7000);
    expect(result.applicationFeeCents).toBe(10333);
  });

  test("edge case: 1 cent nightly total", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 1,
      additionalCostsCents: 0,
      cityTaxCents: 0,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.platformFeeCents).toBe(0);
    expect(result.withholdingTaxCents).toBe(0);
    expect(result.guestTotalCents).toBe(1);
    expect(result.hostPayoutCents).toBe(1);
  });

  test("edge case: 0 total", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 0,
      additionalCostsCents: 0,
      cityTaxCents: 0,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.taxableBaseCents).toBe(0);
    expect(result.platformFeeCents).toBe(0);
    expect(result.withholdingTaxCents).toBe(0);
    expect(result.applicationFeeCents).toBe(0);
    expect(result.guestTotalCents).toBe(0);
    expect(result.hostPayoutCents).toBe(0);
  });

  test("edge case: large amounts (€15,000+)", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 1500000,
      additionalCostsCents: 50000,
      cityTaxCents: 10000,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.taxableBaseCents).toBe(1550000);
    expect(result.platformFeeCents).toBe(155000);
    expect(result.withholdingTaxCents).toBe(325500);
    expect(result.applicationFeeCents).toBe(480500);
    expect(result.guestTotalCents).toBe(1560000);
    expect(result.hostPayoutCents).toBe(1079500);
  });

  test("invariant: guestTotal = nightly + additional + cityTax", () => {
    const inputs = [
      {
        nightlyTotalCents: 80000,
        additionalCostsCents: 10000,
        cityTaxCents: 3000,
      },
      { nightlyTotalCents: 0, additionalCostsCents: 0, cityTaxCents: 0 },
      { nightlyTotalCents: 1, additionalCostsCents: 1, cityTaxCents: 1 },
      {
        nightlyTotalCents: 999999,
        additionalCostsCents: 111111,
        cityTaxCents: 333333,
      },
    ];

    for (const input of inputs) {
      const result = computePaymentSplit({
        ...input,
        feePercent: 10,
        withholdingPercent: 21,
      });
      expect(result.guestTotalCents).toBe(
        input.nightlyTotalCents +
          input.additionalCostsCents +
          input.cityTaxCents
      );
    }
  });

  test("invariant: hostPayout = guestTotal - applicationFee", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 80000,
      additionalCostsCents: 10000,
      cityTaxCents: 3000,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.hostPayoutCents).toBe(
      result.guestTotalCents - result.applicationFeeCents
    );
  });

  test("invariant: applicationFee = platformFee + withholding", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 80000,
      additionalCostsCents: 10000,
      cityTaxCents: 3000,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.applicationFeeCents).toBe(
      result.platformFeeCents + result.withholdingTaxCents
    );
  });
});
