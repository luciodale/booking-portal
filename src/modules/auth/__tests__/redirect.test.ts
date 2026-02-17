import { describe, expect, it } from "bun:test";
import { getSafeRedirectUrl } from "../redirect";

describe("getSafeRedirectUrl", () => {
  it("returns '/' for null", () => {
    expect(getSafeRedirectUrl(null)).toBe("/");
  });

  it("returns '/' for empty string", () => {
    expect(getSafeRedirectUrl("")).toBe("/");
  });

  it("passes through a valid relative path", () => {
    expect(getSafeRedirectUrl("/properties/123")).toBe("/properties/123");
  });

  it("preserves query params on a relative path", () => {
    expect(
      getSafeRedirectUrl("/properties/123?checkIn=2026-03-01&checkOut=2026-03-05")
    ).toBe("/properties/123?checkIn=2026-03-01&checkOut=2026-03-05");
  });

  it("blocks protocol-relative URLs (//evil.com)", () => {
    expect(getSafeRedirectUrl("//evil.com")).toBe("/");
  });

  it("blocks absolute URLs (https://evil.com)", () => {
    expect(getSafeRedirectUrl("https://evil.com")).toBe("/");
  });

  it("blocks backslash-relative URLs (\\evil.com)", () => {
    expect(getSafeRedirectUrl("\\evil.com")).toBe("/");
  });

  it("blocks non-slash relative paths", () => {
    expect(getSafeRedirectUrl("evil.com/hack")).toBe("/");
  });
});
