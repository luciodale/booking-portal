import { describe, expect, test } from "bun:test";
import {
  centsToUnit,
  divideCents,
  multiplyCents,
  percentOfCents,
  sumCents,
  toCents,
} from "../money";

describe("toCents", () => {
  test("whole euros", () => {
    expect(toCents(100)).toBe(10000);
    expect(toCents(0)).toBe(0);
    expect(toCents(1)).toBe(100);
  });

  test("fractional euros", () => {
    expect(toCents(133.33)).toBe(13333);
    expect(toCents(99.99)).toBe(9999);
    expect(toCents(0.01)).toBe(1);
  });

  test("half-cent rounding (ROUND_HALF_UP)", () => {
    expect(toCents(0.005)).toBe(1);
    expect(toCents(0.004)).toBe(0);
    expect(toCents(1.005)).toBe(101);
  });

  test("IEEE 754 notorious values", () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(19.99)).toBe(1999);
  });
});

describe("centsToUnit", () => {
  test("standard conversion", () => {
    expect(centsToUnit(2500)).toBe(25);
    expect(centsToUnit(9999)).toBe(99.99);
    expect(centsToUnit(1)).toBe(0.01);
    expect(centsToUnit(0)).toBe(0);
  });

  test("large amounts", () => {
    expect(centsToUnit(1500000)).toBe(15000);
  });

  test("round-trip with toCents", () => {
    const values = [25, 99.99, 0.01, 133.33, 19.99];
    for (const v of values) {
      expect(centsToUnit(toCents(v))).toBe(v);
    }
  });
});

describe("multiplyCents", () => {
  test("basic multiplication", () => {
    expect(multiplyCents(500, 3)).toBe(1500);
  });

  test("zero factor", () => {
    expect(multiplyCents(500, 0)).toBe(0);
  });

  test("chained city tax: amount * nights * guests", () => {
    const perNightPerGuest = 250;
    const nights = 5;
    const guests = 2;
    expect(multiplyCents(multiplyCents(perNightPerGuest, nights), guests)).toBe(
      2500
    );
  });
});

describe("percentOfCents", () => {
  test("exact percentages", () => {
    expect(percentOfCents(90000, 10)).toBe(9000);
    expect(percentOfCents(90000, 21)).toBe(18900);
  });

  test("fractional results round correctly", () => {
    expect(percentOfCents(33333, 10)).toBe(3333);
    expect(percentOfCents(33333, 21)).toBe(7000);
  });

  test("0% and 100%", () => {
    expect(percentOfCents(50000, 0)).toBe(0);
    expect(percentOfCents(50000, 100)).toBe(50000);
  });

  test("tiny amounts", () => {
    expect(percentOfCents(1, 10)).toBe(0);
    expect(percentOfCents(1, 21)).toBe(0);
  });

  test("reproduces computePaymentSplit test values", () => {
    expect(percentOfCents(55000, 10)).toBe(5500);
    expect(percentOfCents(55000, 21)).toBe(11550);
    expect(percentOfCents(43000, 10)).toBe(4300);
    expect(percentOfCents(43000, 21)).toBe(9030);
    expect(percentOfCents(100000, 15)).toBe(15000);
    expect(percentOfCents(100000, 21)).toBe(21000);
    expect(percentOfCents(10000, 100)).toBe(10000);
    expect(percentOfCents(1550000, 10)).toBe(155000);
    expect(percentOfCents(1550000, 21)).toBe(325500);
  });
});

describe("sumCents", () => {
  test("basic sum", () => {
    expect(sumCents([100, 200, 300])).toBe(600);
  });

  test("empty array", () => {
    expect(sumCents([])).toBe(0);
  });

  test("single element", () => {
    expect(sumCents([42])).toBe(42);
  });
});

describe("divideCents", () => {
  test("even division", () => {
    expect(divideCents(1000, 4)).toBe(250);
  });

  test("uneven division rounds", () => {
    expect(divideCents(1000, 3)).toBe(333);
    expect(divideCents(100, 3)).toBe(33);
  });

  test("tiny amounts", () => {
    expect(divideCents(1, 2)).toBe(1);
    expect(divideCents(1, 3)).toBe(0);
  });
});

describe("invariants", () => {
  test("centsToUnit(toCents(x)) round-trip consistency", () => {
    const values = [0, 1, 0.01, 0.99, 25, 99.99, 133.33, 19.99, 1000];
    for (const v of values) {
      expect(centsToUnit(toCents(v))).toBe(v);
    }
  });
});
