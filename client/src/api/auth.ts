import { apiFetch } from "./client";
import type { SessionUser } from "./types";

export function fetchMe(): Promise<{ user: SessionUser | null }> {
  return apiFetch("/auth/me");
}

export function logout(): Promise<void> {
  return apiFetch("/auth/logout", { method: "POST" });
}
