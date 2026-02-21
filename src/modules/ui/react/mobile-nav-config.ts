const MAX_SIDEBAR_WIDTH_PX = 430;

export function getSidebarWidth() {
  if (typeof window === "undefined") return MAX_SIDEBAR_WIDTH_PX;
  return Math.min(MAX_SIDEBAR_WIDTH_PX, window.innerWidth);
}

export const MOBILE_NAV_SWIPEBAR_PROPS = {
  showToggle: false,
  swipeToOpen: true,
  swipeToClose: true,
  showOverlay: true,
  isAbsolute: true,
  swipeBarZIndex: 60,
  overlayZIndex: 55,
  mediaQueryWidth: 768,
} as const;
