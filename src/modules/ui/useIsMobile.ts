import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 639px)";

export function subscribe(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

export function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
