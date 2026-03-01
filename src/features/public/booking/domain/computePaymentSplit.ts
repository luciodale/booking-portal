type PaymentSplitInput = {
  nightlyTotalCents: number;
  additionalCostsCents: number;
  extrasCents: number;
  cityTaxCents: number;
  feePercent: number;
  withholdingPercent: number;
};

type PaymentSplit = {
  taxableBaseCents: number;
  platformFeeCents: number;
  withholdingTaxCents: number;
  applicationFeeCents: number;
  guestTotalCents: number;
  hostPayoutCents: number;
};

import { percentOfCents } from "@/modules/money/money";

export function computePaymentSplit(input: PaymentSplitInput): PaymentSplit {
  const taxableBaseCents =
    input.nightlyTotalCents + input.additionalCostsCents;

  const platformFeeCents = percentOfCents(taxableBaseCents, input.feePercent);

  const withholdingTaxCents = percentOfCents(
    taxableBaseCents,
    input.withholdingPercent
  );

  const applicationFeeCents = platformFeeCents + withholdingTaxCents;

  const guestTotalCents =
    input.nightlyTotalCents +
    input.additionalCostsCents +
    input.extrasCents +
    input.cityTaxCents;

  const hostPayoutCents = guestTotalCents - applicationFeeCents;

  return {
    taxableBaseCents,
    platformFeeCents,
    withholdingTaxCents,
    applicationFeeCents,
    guestTotalCents,
    hostPayoutCents,
  };
}
