import { describe, expect, test } from "bun:test";
import { computePaymentSplit } from "../computePaymentSplit";

describe("computePaymentSplit", () => {
  test("worked example: €800 nightly + €100 cleaning + €50 taxi + €30 city tax", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 80000,
      additionalCostsCents: 10000,
      extrasCents: 5000,
      cityTaxCents: 3000,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.taxableBaseCents).toBe(90000);
    expect(result.platformFeeCents).toBe(9000);
    expect(result.withholdingTaxCents).toBe(18900);
    expect(result.applicationFeeCents).toBe(27900);
    expect(result.guestTotalCents).toBe(98000);
    expect(result.hostPayoutCents).toBe(70100);
  });

  test("Italian property: 10% fee + 21% withholding on taxable base", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 50000,
      additionalCostsCents: 5000,
      extrasCents: 0,
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
      extrasCents: 2000,
      cityTaxCents: 1000,
      feePercent: 10,
      withholdingPercent: 0,
    });

    expect(result.taxableBaseCents).toBe(55000);
    expect(result.platformFeeCents).toBe(5500);
    expect(result.withholdingTaxCents).toBe(0);
    expect(result.applicationFeeCents).toBe(5500);
    expect(result.guestTotalCents).toBe(58000);
    expect(result.hostPayoutCents).toBe(52500);
  });

  test("zero extras and zero city tax", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 40000,
      additionalCostsCents: 3000,
      extrasCents: 0,
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

  test("extras and city tax excluded from fee/withholding", () => {
    const withExtras = computePaymentSplit({
      nightlyTotalCents: 40000,
      additionalCostsCents: 3000,
      extrasCents: 10000,
      cityTaxCents: 5000,
      feePercent: 10,
      withholdingPercent: 21,
    });

    const withoutExtras = computePaymentSplit({
      nightlyTotalCents: 40000,
      additionalCostsCents: 3000,
      extrasCents: 0,
      cityTaxCents: 0,
      feePercent: 10,
      withholdingPercent: 21,
    });

    // Fee and withholding are identical regardless of extras/city tax
    expect(withExtras.platformFeeCents).toBe(withoutExtras.platformFeeCents);
    expect(withExtras.withholdingTaxCents).toBe(
      withoutExtras.withholdingTaxCents
    );
    expect(withExtras.applicationFeeCents).toBe(
      withoutExtras.applicationFeeCents
    );
    // Guest total differs by pass-through amounts
    expect(withExtras.guestTotalCents).toBe(
      withoutExtras.guestTotalCents + 10000 + 5000
    );
  });

  test("custom fee override: 0% fee", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 50000,
      additionalCostsCents: 5000,
      extrasCents: 0,
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
      extrasCents: 0,
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
      extrasCents: 0,
      cityTaxCents: 0,
      feePercent: 100,
      withholdingPercent: 0,
    });

    expect(result.platformFeeCents).toBe(10000);
    expect(result.applicationFeeCents).toBe(10000);
    expect(result.hostPayoutCents).toBe(0);
  });

  test("rounding: fractional cent amounts round correctly", () => {
    // 33333 * 10 / 100 = 3333.3 → rounds to 3333
    const result = computePaymentSplit({
      nightlyTotalCents: 33333,
      additionalCostsCents: 0,
      extrasCents: 0,
      cityTaxCents: 0,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.platformFeeCents).toBe(3333);
    // 33333 * 21 / 100 = 6999.93 → rounds to 7000
    expect(result.withholdingTaxCents).toBe(7000);
    expect(result.applicationFeeCents).toBe(10333);
  });

  test("edge case: 1 cent nightly total", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 1,
      additionalCostsCents: 0,
      extrasCents: 0,
      cityTaxCents: 0,
      feePercent: 10,
      withholdingPercent: 21,
    });

    // 1 * 10 / 100 = 0.1 → rounds to 0
    expect(result.platformFeeCents).toBe(0);
    // 1 * 21 / 100 = 0.21 → rounds to 0
    expect(result.withholdingTaxCents).toBe(0);
    expect(result.guestTotalCents).toBe(1);
    expect(result.hostPayoutCents).toBe(1);
  });

  test("edge case: 0 total", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 0,
      additionalCostsCents: 0,
      extrasCents: 0,
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
      extrasCents: 20000,
      cityTaxCents: 10000,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.taxableBaseCents).toBe(1550000);
    expect(result.platformFeeCents).toBe(155000);
    expect(result.withholdingTaxCents).toBe(325500);
    expect(result.applicationFeeCents).toBe(480500);
    expect(result.guestTotalCents).toBe(1580000);
    expect(result.hostPayoutCents).toBe(1099500);
  });

  test("invariant: guestTotal = nightly + additional + extras + cityTax", () => {
    const inputs = [
      { nightlyTotalCents: 80000, additionalCostsCents: 10000, extrasCents: 5000, cityTaxCents: 3000 },
      { nightlyTotalCents: 0, additionalCostsCents: 0, extrasCents: 0, cityTaxCents: 0 },
      { nightlyTotalCents: 1, additionalCostsCents: 1, extrasCents: 1, cityTaxCents: 1 },
      { nightlyTotalCents: 999999, additionalCostsCents: 111111, extrasCents: 222222, cityTaxCents: 333333 },
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
          input.extrasCents +
          input.cityTaxCents
      );
    }
  });

  test("invariant: hostPayout = guestTotal - applicationFee", () => {
    const result = computePaymentSplit({
      nightlyTotalCents: 80000,
      additionalCostsCents: 10000,
      extrasCents: 5000,
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
      extrasCents: 5000,
      cityTaxCents: 3000,
      feePercent: 10,
      withholdingPercent: 21,
    });

    expect(result.applicationFeeCents).toBe(
      result.platformFeeCents + result.withholdingTaxCents
    );
  });
});
