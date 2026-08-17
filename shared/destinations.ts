/**
 * Keeps external destinations optional. Invalid or absent values deliberately
 * resolve to the internal specialist-review section so no user reaches a dead end.
 */
export function resolveOptionalDestination(value: string | undefined, fallback = "#booking") {
  const candidate = value?.trim();
  if (!candidate) return fallback;

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}
