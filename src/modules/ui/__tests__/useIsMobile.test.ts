import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { getServerSnapshot, getSnapshot, subscribe } from "../useIsMobile";

describe("useIsMobile helpers", () => {
  let originalWindow: typeof globalThis.window;
  let listeners: Set<() => void>;
  let matchesValue: boolean;

  beforeAll(() => {
    originalWindow = globalThis.window;
    listeners = new Set();
    matchesValue = false;

    // @ts-expect-error – partial window mock for bun test env
    globalThis.window = {
      matchMedia(_query: string) {
        return {
          get matches() {
            return matchesValue;
          },
          addEventListener(_event: string, cb: () => void) {
            listeners.add(cb);
          },
          removeEventListener(_event: string, cb: () => void) {
            listeners.delete(cb);
          },
        };
      },
    };
  });

  afterAll(() => {
    globalThis.window = originalWindow;
  });

  it("getSnapshot returns true when viewport <= 639px", () => {
    matchesValue = true;
    expect(getSnapshot()).toBe(true);
  });

  it("getSnapshot returns false when viewport > 639px", () => {
    matchesValue = false;
    expect(getSnapshot()).toBe(false);
  });

  it("getServerSnapshot always returns false", () => {
    expect(getServerSnapshot()).toBe(false);
  });

  it("subscribe registers and cleans up a listener", () => {
    const cb = () => {};
    const unsubscribe = subscribe(cb);
    expect(listeners.has(cb)).toBe(true);
    unsubscribe();
    expect(listeners.has(cb)).toBe(false);
  });
});
