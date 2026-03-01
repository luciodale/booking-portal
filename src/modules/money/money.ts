import Decimal from "decimal.js-light";

Decimal.set({ rounding: Decimal.ROUND_HALF_UP });

export function toCents(amount: number): number {
  return new Decimal(amount).times(100).toDecimalPlaces(0).toNumber();
}

export function centsToUnit(cents: number): number {
  return new Decimal(cents).dividedBy(100).toNumber();
}

export function multiplyCents(cents: number, factor: number): number {
  return new Decimal(cents).times(factor).toDecimalPlaces(0).toNumber();
}

export function percentOfCents(cents: number, percent: number): number {
  return new Decimal(cents).times(percent).dividedBy(100).toDecimalPlaces(0).toNumber();
}

export function sumCents(values: number[]): number {
  return values
    .reduce((acc, v) => acc.plus(v), new Decimal(0))
    .toDecimalPlaces(0)
    .toNumber();
}

export function divideCents(total: number, divisor: number): number {
  return new Decimal(total).dividedBy(divisor).toDecimalPlaces(0).toNumber();
}
