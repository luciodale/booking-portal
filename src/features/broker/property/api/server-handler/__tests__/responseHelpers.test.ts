import { describe, expect, test } from "vitest";
import { mapErrorToStatus, safeErrorMessage } from "../responseHelpers";

describe("mapErrorToStatus", () => {
  test("returns 401 for Unauthorized", () => {
    expect(mapErrorToStatus(new Error("Unauthorized"))).toBe(401);
  });

  test("returns 403 for Forbidden", () => {
    expect(mapErrorToStatus(new Error("Forbidden"))).toBe(403);
  });

  test("returns 403 for Forbidden with detail", () => {
    expect(mapErrorToStatus(new Error("Forbidden: not owner"))).toBe(403);
  });

  test("returns 500 for generic errors", () => {
    expect(mapErrorToStatus(new Error("Something broke"))).toBe(500);
  });

  test("returns 500 for non-Error values", () => {
    expect(mapErrorToStatus("string error")).toBe(500);
    expect(mapErrorToStatus(null)).toBe(500);
    expect(mapErrorToStatus(undefined)).toBe(500);
  });
});

describe("safeErrorMessage", () => {
  test("returns fallback for non-Error values", () => {
    expect(safeErrorMessage("oops", "Something went wrong")).toBe(
      "Something went wrong"
    );
  });

  test("returns message for Unauthorized", () => {
    expect(safeErrorMessage(new Error("Unauthorized"), "fallback")).toBe(
      "Unauthorized"
    );
  });

  test("returns message for Forbidden", () => {
    expect(
      safeErrorMessage(new Error("Forbidden: not your resource"), "fallback")
    ).toBe("Forbidden: not your resource");
  });

  test("returns friendly message for UNIQUE constraint", () => {
    expect(
      safeErrorMessage(
        new Error("UNIQUE constraint failed: users.email"),
        "fallback"
      )
    ).toBe("This record already exists");
  });

  test("returns friendly message for NOT NULL constraint", () => {
    expect(
      safeErrorMessage(
        new Error("NOT NULL constraint failed: assets.title"),
        "fallback"
      )
    ).toBe("A required field is missing");
  });

  test("returns fallback for SQLITE errors", () => {
    expect(
      safeErrorMessage(new Error("SQLITE_BUSY: database is locked"), "fallback")
    ).toBe("fallback");
  });

  test("returns fallback for generic errors", () => {
    expect(safeErrorMessage(new Error("unexpected null"), "fallback")).toBe(
      "fallback"
    );
  });
});
