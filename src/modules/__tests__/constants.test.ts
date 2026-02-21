import { describe, expect, it } from "vitest";
import {
  HIGHLIGHT_OPTIONS,
  STANDARD_AMENITIES,
  VIEW_OPTIONS,
  getDefaultIcon,
  getFacilityOptions,
  isDefaultFacility,
} from "../constants";

describe("getDefaultIcon", () => {
  it("returns correct icon for known amenity", () => {
    expect(getDefaultIcon("pool", "amenity")).toBe("waves");
    expect(getDefaultIcon("wifi", "amenity")).toBe("wifi");
    expect(getDefaultIcon("elevator", "amenity")).toBe("arrow-up-down");
  });

  it("returns null for unknown amenity", () => {
    expect(getDefaultIcon("unknown-thing", "amenity")).toBeNull();
  });

  it("returns correct icon for known highlight", () => {
    expect(getDefaultIcon("private-pool", "highlight")).toBe("waves");
    expect(getDefaultIcon("wine-cellar", "highlight")).toBe("wine");
  });

  it("returns null for unknown highlight", () => {
    expect(getDefaultIcon("custom-highlight", "highlight")).toBeNull();
  });

  it("returns correct icon for known view", () => {
    expect(getDefaultIcon("sea-view", "view")).toBe("waves");
    expect(getDefaultIcon("mountain-view", "view")).toBe("mountain");
  });

  it("returns null for unknown view", () => {
    expect(getDefaultIcon("space-view", "view")).toBeNull();
  });
});

describe("isDefaultFacility", () => {
  it("returns true for known amenity", () => {
    expect(isDefaultFacility("pool", "amenity")).toBe(true);
    expect(isDefaultFacility("wifi", "amenity")).toBe(true);
  });

  it("returns false for unknown amenity", () => {
    expect(isDefaultFacility("unknown", "amenity")).toBe(false);
  });

  it("returns true for known highlight", () => {
    expect(isDefaultFacility("private-pool", "highlight")).toBe(true);
  });

  it("returns false for unknown highlight", () => {
    expect(isDefaultFacility("custom", "highlight")).toBe(false);
  });

  it("returns true for known view", () => {
    expect(isDefaultFacility("sea-view", "view")).toBe(true);
  });

  it("returns false for unknown view", () => {
    expect(isDefaultFacility("unknown", "view")).toBe(false);
  });
});

describe("no duplicate IDs within groups", () => {
  it("STANDARD_AMENITIES has unique IDs", () => {
    const ids = STANDARD_AMENITIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("HIGHLIGHT_OPTIONS has unique IDs", () => {
    const ids = HIGHLIGHT_OPTIONS.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("VIEW_OPTIONS has unique IDs", () => {
    const ids = VIEW_OPTIONS.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("all entries have non-empty iconName", () => {
  it("STANDARD_AMENITIES", () => {
    for (const a of STANDARD_AMENITIES) {
      expect(a.iconName).toBeTruthy();
    }
  });

  it("HIGHLIGHT_OPTIONS", () => {
    for (const h of HIGHLIGHT_OPTIONS) {
      expect(h.iconName).toBeTruthy();
    }
  });

  it("VIEW_OPTIONS", () => {
    for (const v of VIEW_OPTIONS) {
      expect(v.iconName).toBeTruthy();
    }
  });
});

describe("getFacilityOptions", () => {
  it("returns options with value and icon for amenities", () => {
    const opts = getFacilityOptions("amenity");
    expect(opts.length).toBe(STANDARD_AMENITIES.length);
    for (const opt of opts) {
      expect(opt.value).toBeTruthy();
      expect(opt.icon).toBeTruthy();
    }
  });

  it("returns options with value and icon for highlights", () => {
    const opts = getFacilityOptions("highlight");
    expect(opts.length).toBe(HIGHLIGHT_OPTIONS.length);
  });

  it("returns options with value and icon for views", () => {
    const opts = getFacilityOptions("view");
    expect(opts.length).toBe(VIEW_OPTIONS.length);
  });
});
