import { resolveOptionalDestination } from "@shared/destinations";

/** Optional public settings. Every unset destination returns the safe internal fallback. */
export const destinations = {
  booking: resolveOptionalDestination(import.meta.env.VITE_BOOKING_URL),
  funding: resolveOptionalDestination(import.meta.env.VITE_FUNDING_PROVIDER_URL),
  retirement: resolveOptionalDestination(import.meta.env.VITE_RETIREMENT_PROVIDER_URL),
} as const;

export function destinationForCategory(code: string) {
  if (code === "D") return destinations.funding;
  if (code === "R") return destinations.retirement;
  return destinations.booking;
}
