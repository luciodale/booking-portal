import { describe, expect, it } from "vitest";
import type { Feature } from "@/modules/constants";
import {
  displayToKebab,
  isDefaultCollision,
  kebabToDisplay,
  syncFeatureFields,
} from "../sync-features";

function f(name: string, icon = "check"): Feature {
  return { name, icon };
}

describe("syncFeatureFields", () => {
  const emptyFields = {
    amenities: [] as Feature[],
    highlights: [] as Feature[],
    views: [] as Feature[],
  };

  describe("adding items", () => {
    it("adds item to empty field", () => {
      const result = syncFeatureFields(emptyFields, "amenities", [
        f("pool", "waves"),
      ]);

      expect(result).toEqual({
        amenities: [f("pool", "waves")],
        highlights: [],
        views: [],
      });
    });

    it("adds multiple items to field", () => {
      const result = syncFeatureFields(emptyFields, "highlights", [
        f("spa", "sparkles"),
        f("chef", "chef-hat"),
      ]);

      expect(result).toEqual({
        amenities: [],
        highlights: [f("spa", "sparkles"), f("chef", "chef-hat")],
        views: [],
      });
    });
  });

  describe("syncing across fields", () => {
    it("removes item from other fields when added", () => {
      const current = {
        amenities: [f("pool", "waves"), f("wifi", "wifi")],
        highlights: [],
        views: [],
      };

      const result = syncFeatureFields(current, "highlights", [
        f("pool", "waves"),
      ]);

      expect(result).toEqual({
        amenities: [f("wifi", "wifi")],
        highlights: [f("pool", "waves")],
        views: [],
      });
    });

    it("removes item from multiple other fields", () => {
      const current = {
        amenities: [f("pool", "waves")],
        highlights: [f("spa", "sparkles")],
        views: [f("pool", "waves"), f("sea", "waves")],
      };

      const result = syncFeatureFields(current, "highlights", [
        f("spa", "sparkles"),
        f("pool", "waves"),
      ]);

      expect(result).toEqual({
        amenities: [],
        highlights: [f("spa", "sparkles"), f("pool", "waves")],
        views: [f("sea", "waves")],
      });
    });

    it("handles item moving from highlights to views", () => {
      const current = {
        amenities: [],
        highlights: [f("sunset", "sun")],
        views: [f("sea", "waves")],
      };

      const result = syncFeatureFields(current, "views", [
        f("sea", "waves"),
        f("sunset", "sun"),
      ]);

      expect(result).toEqual({
        amenities: [],
        highlights: [],
        views: [f("sea", "waves"), f("sunset", "sun")],
      });
    });
  });

  describe("removing items", () => {
    it("removes item without affecting other fields", () => {
      const current = {
        amenities: [f("pool", "waves"), f("wifi", "wifi")],
        highlights: [f("spa", "sparkles")],
        views: [f("sea", "waves")],
      };

      const result = syncFeatureFields(current, "amenities", [
        f("pool", "waves"),
      ]);

      expect(result).toEqual({
        amenities: [f("pool", "waves")],
        highlights: [f("spa", "sparkles")],
        views: [f("sea", "waves")],
      });
    });
  });

  describe("no changes", () => {
    it("returns same values when nothing added", () => {
      const current = {
        amenities: [f("pool", "waves")],
        highlights: [f("spa", "sparkles")],
        views: [f("sea", "waves")],
      };

      const result = syncFeatureFields(current, "amenities", [
        f("pool", "waves"),
      ]);

      expect(result).toEqual(current);
    });
  });

  describe("edge cases", () => {
    it("handles empty new value", () => {
      const current = {
        amenities: [f("pool", "waves"), f("wifi", "wifi")],
        highlights: [],
        views: [],
      };

      const result = syncFeatureFields(current, "amenities", []);

      expect(result).toEqual({
        amenities: [],
        highlights: [],
        views: [],
      });
    });

    it("does not affect other fields when removing all items", () => {
      const current = {
        amenities: [f("pool", "waves")],
        highlights: [f("spa", "sparkles")],
        views: [f("sea", "waves")],
      };

      const result = syncFeatureFields(current, "amenities", []);

      expect(result).toEqual({
        amenities: [],
        highlights: [f("spa", "sparkles")],
        views: [f("sea", "waves")],
      });
    });
  });
});

describe("kebabToDisplay", () => {
  it("converts single word", () => {
    expect(kebabToDisplay("pool")).toBe("Pool");
  });

  it("converts kebab-case to display format", () => {
    expect(kebabToDisplay("private-pool")).toBe("Private Pool");
  });

  it("converts multiple dashes", () => {
    expect(kebabToDisplay("private-beach-access")).toBe("Private Beach Access");
  });

  it("handles already capitalized words", () => {
    expect(kebabToDisplay("spa-wellness")).toBe("Spa Wellness");
  });

  it("handles empty string", () => {
    expect(kebabToDisplay("")).toBe("");
  });
});

describe("displayToKebab", () => {
  it("converts single word to lowercase", () => {
    expect(displayToKebab("Pool")).toBe("pool");
  });

  it("converts display format to kebab-case", () => {
    expect(displayToKebab("Private Pool")).toBe("private-pool");
  });

  it("converts multiple spaces", () => {
    expect(displayToKebab("Private Beach Access")).toBe("private-beach-access");
  });

  it("handles multiple consecutive spaces", () => {
    expect(displayToKebab("Private  Pool   Access")).toBe(
      "private-pool-access"
    );
  });

  it("trims leading and trailing spaces", () => {
    expect(displayToKebab("  Private Pool  ")).toBe("private-pool");
  });

  it("handles mixed case input", () => {
    expect(displayToKebab("PrIvAtE PoOl")).toBe("private-pool");
  });

  it("handles empty string", () => {
    expect(displayToKebab("")).toBe("");
  });

  it("handles already kebab-case", () => {
    expect(displayToKebab("private-pool")).toBe("private-pool");
  });
});

describe("isDefaultCollision", () => {
  const defaults = new Set(["hot-tub", "pool", "wifi", "spa"]);

  it("detects exact kebab match", () => {
    expect(isDefaultCollision("hot-tub", defaults)).toBe(true);
  });

  it("detects display-format match after kebab conversion", () => {
    expect(isDefaultCollision("Hot Tub", defaults)).toBe(true);
  });

  it("detects match with extra whitespace", () => {
    expect(isDefaultCollision("  hot  tub  ", defaults)).toBe(true);
  });

  it("detects match with mixed case", () => {
    expect(isDefaultCollision("HOT TUB", defaults)).toBe(true);
  });

  it("returns false for non-default name", () => {
    expect(isDefaultCollision("steam-room", defaults)).toBe(false);
  });

  it("returns false for empty input", () => {
    expect(isDefaultCollision("", defaults)).toBe(false);
  });

  it("detects single-word default", () => {
    expect(isDefaultCollision("Pool", defaults)).toBe(true);
    expect(isDefaultCollision("Wifi", defaults)).toBe(true);
  });
});
