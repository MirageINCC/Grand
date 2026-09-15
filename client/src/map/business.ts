import { useEffect, useState } from "react";
import type { Marker } from "../api/types";

/** A marker "is" an Unternehmen (business) purely by its category name — no dedicated flag in
 *  the data model, see the plan discussion: simplest option, at the cost of breaking silently if
 *  this category is ever renamed (the marker/category itself is unaffected, it just stops
 *  appearing as a business). */
export const BUSINESS_CATEGORY_NAME = "Unternehmen";

const HOUR_MS = 60 * 60 * 1000;
export const COLLECT_TIMER_MS = 24 * HOUR_MS;
export const WARNING_THRESHOLD_MS = 5 * HOUR_MS;
export const COLLECT_COOLDOWN_MS = 15 * 60 * 1000;

export function isBusinessMarker(marker: Marker): boolean {
  return marker.category.name.trim() === BUSINESS_CATEGORY_NAME;
}

/** Milliseconds until the 24h collect timer runs out, floored at 0. */
export function remainingCollectMs(marker: Marker, now: number): number {
  const elapsed = now - new Date(marker.lastCollectedAt).getTime();
  return Math.max(0, COLLECT_TIMER_MS - elapsed);
}

/** Whether the "Abholen" button should still be disabled (15 min after the last collect). */
export function isCollectOnCooldown(marker: Marker, now: number): boolean {
  const elapsed = now - new Date(marker.lastCollectedAt).getTime();
  return elapsed < COLLECT_COOLDOWN_MS;
}

export function formatHoursMinutes(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}h`;
}

/** Ticking clock, re-rendering whatever uses it every `intervalMs` — drives the live countdowns
 *  and the collect-timer/cooldown checks without needing a page reload. */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
