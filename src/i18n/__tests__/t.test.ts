import { describe, expect, test } from "bun:test";
import { t } from "../t";

describe("t() translation function", () => {
  test("returns English string for 'en' locale", () => {
    expect(t("en", "nav.home")).toBe("Home");
  });

  test("returns Italian string for 'it' locale", () => {
    expect(t("it", "nav.home")).toBe("Home");
  });

  test("falls back to English for unknown locale", () => {
    expect(t("fr", "nav.home")).toBe("Home");
  });

  test("falls back to English for undefined locale", () => {
    expect(t(undefined, "nav.home")).toBe("Home");
  });

  test("returns key string for unknown key", () => {
    // @ts-expect-error testing invalid key
    expect(t("en", "nonexistent.key")).toBe("nonexistent.key");
  });

  test("interpolates single parameter", () => {
    expect(t("en", "error.minStay", { nights: 3 })).toBe(
      "Minimum stay is 3 nights for the selected dates"
    );
  });

  test("interpolates multiple parameters", () => {
    expect(
      t("en", "error.nightPriceMismatch", { expected: 5, received: 3 })
    ).toBe("Expected 5 night prices, received 3");
  });

  test("interpolates Italian parameters", () => {
    expect(t("it", "error.minStay", { nights: 3 })).toBe(
      "Il soggiorno minimo è di 3 notti per le date selezionate"
    );
  });

  test("handles missing params gracefully (leaves placeholder)", () => {
    expect(t("en", "error.minStay")).toBe(
      "Minimum stay is {nights} nights for the selected dates"
    );
  });
});

describe("dictionary completeness", () => {
  test("Italian and English dictionaries have identical key sets", async () => {
    const { dictionaries } = await import("../translations/dictionary");
    const enKeys = Object.keys(dictionaries.en).sort();
    const itKeys = Object.keys(dictionaries.it).sort();
    expect(itKeys).toEqual(enKeys);
  });
});
