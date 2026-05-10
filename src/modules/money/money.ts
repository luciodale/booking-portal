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

export function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

export function formatCentsAsPrice(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(centsToUnit(cents));
  } catch {
    return `${currency.toUpperCase()} ${centsToUnit(cents).toFixed(2)}`;
  }
}
