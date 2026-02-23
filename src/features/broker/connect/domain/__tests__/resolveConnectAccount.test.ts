import { describe, expect, test } from "vitest";

type UserRow = {
  stripeConnectedAccountId: string | null;
};

function resolveFromRow(user: UserRow | undefined): string | null {
  return user?.stripeConnectedAccountId ?? null;
}

describe("resolveConnectAccount", () => {
  test("returns account ID when user has one", () => {
    const user: UserRow = { stripeConnectedAccountId: "acct_123abc" };
    expect(resolveFromRow(user)).toBe("acct_123abc");
  });

  test("returns null when user has no connected account", () => {
    const user: UserRow = { stripeConnectedAccountId: null };
    expect(resolveFromRow(user)).toBeNull();
  });

  test("returns null when user does not exist", () => {
    expect(resolveFromRow(undefined)).toBeNull();
  });
});
