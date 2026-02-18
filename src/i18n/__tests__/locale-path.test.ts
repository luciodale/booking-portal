import { describe, expect, test } from "bun:test";
import { localePath, stripLocalePrefix, switchLocale } from "../locale-path";

describe("localePath", () => {
  test("returns path unchanged for default locale (en)", () => {
    expect(localePath("en", "/elite")).toBe("/elite");
  });

  test("prepends /it for Italian locale", () => {
    expect(localePath("it", "/elite")).toBe("/it/elite");
  });

  test("handles root path", () => {
    expect(localePath("it", "/")).toBe("/it/");
  });

  test("returns path unchanged for undefined locale", () => {
    expect(localePath(undefined, "/about")).toBe("/about");
  });

  test("normalizes paths without leading slash", () => {
    expect(localePath("it", "elite")).toBe("/it/elite");
  });
});

describe("switchLocale", () => {
  test("switches from English to Italian", () => {
    expect(switchLocale("/elite", "it")).toBe("/it/elite");
  });

  test("switches from Italian to English", () => {
    expect(switchLocale("/it/elite", "en")).toBe("/elite");
  });

  test("switches Italian root to English root", () => {
    expect(switchLocale("/it", "en")).toBe("/");
  });

  test("handles paths with nested segments", () => {
    expect(switchLocale("/it/property/123", "en")).toBe("/property/123");
  });
});

describe("stripLocalePrefix", () => {
  test("strips /it prefix", () => {
    expect(stripLocalePrefix("/it/elite")).toBe("/elite");
  });

  test("returns root for /it alone", () => {
    expect(stripLocalePrefix("/it")).toBe("/");
  });

  test("does not strip default locale (en has no prefix)", () => {
    expect(stripLocalePrefix("/elite")).toBe("/elite");
  });

  test("does not strip unrecognized locale prefixes", () => {
    expect(stripLocalePrefix("/fr/elite")).toBe("/fr/elite");
  });
});
