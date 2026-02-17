/** Validates a raw redirect string is a safe relative path; falls back to "/" */
export function getSafeRedirectUrl(raw: string | null): string {
  if (!raw) return "/";
  if (
    raw.startsWith("//") ||
    raw.startsWith("\\") ||
    raw.includes("://")
  ) {
    return "/";
  }
  if (!raw.startsWith("/")) return "/";
  return raw;
}

/** Reads `redirect_url` from the current page's query string and validates it */
export function getRedirectFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return getSafeRedirectUrl(params.get("redirect_url"));
}

/** Builds `/sign-in?redirect_url=<encoded pathname+search>` from the current page */
export function buildSignInRedirect(): string {
  const current = window.location.pathname + window.location.search;
  return `/sign-in?redirect_url=${encodeURIComponent(current)}`;
}

/** Forwards the existing `redirect_url` param when linking between /sign-in and /sign-up */
export function buildAuthCrossLink(target: "/sign-in" | "/sign-up"): string {
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get("redirect_url");
  if (redirectUrl) {
    return `${target}?redirect_url=${encodeURIComponent(redirectUrl)}`;
  }
  return target;
}
