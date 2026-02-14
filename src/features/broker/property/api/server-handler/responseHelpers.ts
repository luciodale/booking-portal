export function jsonSuccess<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function jsonError(
  message: string,
  status = 500,
  details?: unknown
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { message, details },
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function mapErrorToStatus(error: unknown): number {
  if (!(error instanceof Error)) return 500;
  const msg = error.message;
  if (msg === "Unauthorized") return 401;
  if (msg.startsWith("Forbidden")) return 403;
  return 500;
}
