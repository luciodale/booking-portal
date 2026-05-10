/**
 * Defensive text sanitisation for user supplied free text that lands in DB
 * columns and may eventually be rendered. Astro and React both escape by
 * default, so this is defence in depth.
 *
 * Strips HTML tags, ASCII control characters, and trims to a hard length.
 */
// biome-ignore lint/suspicious/noControlCharactersInRegex: stripping is the goal
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function sanitizeFreeText(
  raw: string | null | undefined,
  maxLen: number
): string | null {
  if (raw == null) return null;
  const stripped = raw
    .replace(/<[^>]*>/g, "")
    .replace(CONTROL_CHARS, "")
    .trim();
  if (!stripped) return null;
  return stripped.slice(0, maxLen);
}
