import { describe, expect, it } from "vitest";
import {
  displayToKebab,
  kebabToDisplay,
  syncFeatureFields,
} from "../sync-features";

describe("syncFeatureFields", () => {
  const emptyFields = {
    amenities: [],
    highlights: [],
    views: [],
  };

  describe("adding items", () => {
    it("adds item to empty field", () => {
      const result = syncFeatureFields(emptyFields, "amenities", ["pool"]);

      expect(result).toEqual({
        amenities: ["pool"],
        highlights: [],
        views: [],
      });
    });

    it("adds multiple items to field", () => {
      const result = syncFeatureFields(emptyFields, "highlights", [
        "spa",
        "chef",
      ]);

      expect(result).toEqual({
        amenities: [],
        highlights: ["spa", "chef"],
        views: [],
      });
    });
  });

  describe("syncing across fields", () => {
    it("removes item from other fields when added", () => {
      const current = {
        amenities: ["pool", "wifi"],
        highlights: [],
        views: [],
      };

      const result = syncFeatureFields(current, "highlights", ["pool"]);

      expect(result).toEqual({
        amenities: ["wifi"],
        highlights: ["pool"],
        views: [],
      });
    });

    it("removes item from multiple other fields", () => {
      const current = {
        amenities: ["pool"],
        highlights: ["spa"],
        views: ["pool", "sea"],
      };

      const result = syncFeatureFields(current, "highlights", ["spa", "pool"]);

      expect(result).toEqual({
        amenities: [],
        highlights: ["spa", "pool"],
        views: ["sea"],
      });
    });

    it("handles item moving from highlights to views", () => {
      const current = {
        amenities: [],
        highlights: ["sunset"],
        views: ["sea"],
      };

      const result = syncFeatureFields(current, "views", ["sea", "sunset"]);

      expect(result).toEqual({
        amenities: [],
        highlights: [],
        views: ["sea", "sunset"],
      });
    });
  });

  describe("removing items", () => {
    it("removes item without affecting other fields", () => {
      const current = {
        amenities: ["pool", "wifi"],
        highlights: ["spa"],
        views: ["sea"],
      };

      const result = syncFeatureFields(current, "amenities", ["pool"]);

      expect(result).toEqual({
        amenities: ["pool"],
        highlights: ["spa"],
        views: ["sea"],
      });
    });
  });

  describe("no changes", () => {
    it("returns same values when nothing added", () => {
      const current = {
        amenities: ["pool"],
        highlights: ["spa"],
        views: ["sea"],
      };

      const result = syncFeatureFields(current, "amenities", ["pool"]);

      expect(result).toEqual(current);
    });
  });

  describe("edge cases", () => {
    it("handles empty new value", () => {
      const current = {
        amenities: ["pool", "wifi"],
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
        amenities: ["pool"],
        highlights: ["spa"],
        views: ["sea"],
      };

      const result = syncFeatureFields(current, "amenities", []);

      expect(result).toEqual({
        amenities: [],
        highlights: ["spa"],
        views: ["sea"],
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
