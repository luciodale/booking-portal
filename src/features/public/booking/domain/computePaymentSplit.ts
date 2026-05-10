import { percentOfCents, sumCents } from "@/modules/money/money";

type PaymentSplitInput = {
  nightlyTotalCents: number;
  additionalCostsCents: number;
  cityTaxCents: number;
  feePercent: number;
  withholdingPercent: number;
};

export type PaymentSplit = {
  taxableBaseCents: number;
  platformFeeCents: number;
  withholdingTaxCents: number;
  applicationFeeCents: number;
  guestTotalCents: number;
  hostPayoutCents: number;
};

export class NegativeHostPayoutError extends Error {
  constructor(public readonly split: PaymentSplit) {
    super(
      `Host payout would be negative: ${split.hostPayoutCents} cents (guest total ${split.guestTotalCents}, app fee ${split.applicationFeeCents}).`
    );
    this.name = "NegativeHostPayoutError";
  }
}

export function computePaymentSplit(input: PaymentSplitInput): PaymentSplit {
  const taxableBaseCents = sumCents([
    input.nightlyTotalCents,
    input.additionalCostsCents,
  ]);

  const platformFeeCents = percentOfCents(taxableBaseCents, input.feePercent);

  const withholdingTaxCents = percentOfCents(
    taxableBaseCents,
    input.withholdingPercent
  );

  const applicationFeeCents = sumCents([platformFeeCents, withholdingTaxCents]);

  const guestTotalCents = sumCents([
    input.nightlyTotalCents,
    input.additionalCostsCents,
    input.cityTaxCents,
  ]);

  const hostPayoutCents = guestTotalCents - applicationFeeCents;

  const split: PaymentSplit = {
    taxableBaseCents,
    platformFeeCents,
    withholdingTaxCents,
    applicationFeeCents,
    guestTotalCents,
    hostPayoutCents,
  };

  if (hostPayoutCents < 0) {
    throw new NegativeHostPayoutError(split);
  }

  return split;
}
