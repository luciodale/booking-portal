/**
 * Wrapper around Cloudflare's Rate Limiting binding. Each binding ships
 * its own counter namespace and limit, so we map routes to binding names
 * and pick a stable per request key (user id when authenticated, otherwise
 * client IP).
 */

export type RateLimiterBinding = {
  limit: (input: { key: string }) => Promise<{ success: boolean }>;
};

export type RateLimitTarget = "public" | "smoobu" | "checkout" | "upload";

type Env = {
  RL_PUBLIC?: RateLimiterBinding;
  RL_SMOOBU?: RateLimiterBinding;
  RL_CHECKOUT?: RateLimiterBinding;
  RL_UPLOAD?: RateLimiterBinding;
};

function pickBinding(
  env: Env,
  target: RateLimitTarget
): RateLimiterBinding | undefined {
  switch (target) {
    case "public":
      return env.RL_PUBLIC;
    case "smoobu":
      return env.RL_SMOOBU;
    case "checkout":
      return env.RL_CHECKOUT;
    case "upload":
      return env.RL_UPLOAD;
  }
}

export function clientIpFromRequest(request: Request): string {
  // Cloudflare always sets CF-Connecting-IP server side. Falls back to a
  // shared bucket so a missing header cannot bypass the limiter.
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

export async function enforceRateLimit(
  env: Env,
  target: RateLimitTarget,
  key: string
): Promise<boolean> {
  const binding = pickBinding(env, target);
  if (!binding) return true; // No binding in dev / preview: do not block.
  const result = await binding.limit({ key: `${target}:${key}` });
  return result.success;
}

export function tooManyRequestsResponse(): Response {
  return new Response(JSON.stringify({ error: "rate_limited" }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": "60",
    },
  });
}
