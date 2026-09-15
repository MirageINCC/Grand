import { apiFetch } from "./client";
import type { Marker } from "./types";

export type MarkerInput = { title: string; description: string; x: number; y: number; categoryId: string };

export function listMarkers(): Promise<Marker[]> {
  return apiFetch("/api/markers");
}

export function createMarker(input: MarkerInput): Promise<Marker> {
  return apiFetch("/api/markers", { method: "POST", body: JSON.stringify(input) });
}

export function updateMarker(id: string, input: Partial<MarkerInput>): Promise<Marker> {
  return apiFetch(`/api/markers/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteMarker(id: string): Promise<void> {
  return apiFetch(`/api/markers/${id}`, { method: "DELETE" });
}

/** Resets the 24h "Unternehmen" collect timer for a marker. Any logged-in user may call this. */
export function collectMarker(id: string): Promise<Marker> {
  return apiFetch(`/api/markers/${id}/collect`, { method: "POST" });
}
