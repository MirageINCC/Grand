import jwt from "jsonwebtoken";
import { env } from "../env.js";

export interface SessionUser {
  id: string;
  username: string;
  avatar: string | null;
  isAdmin: boolean;
}

export const SESSION_COOKIE = "gta_map_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24h — see plan: role changes in Discord take effect on next login/expiry, not live per-request.

export function signSession(user: SessionUser): string {
  return jwt.sign(user, env.SESSION_SECRET, { expiresIn: SESSION_TTL_SECONDS });
}

export function verifySession(token: string): SessionUser | null {
  try {
    const payload = jwt.verify(token, env.SESSION_SECRET);
    if (
      typeof payload === "object" &&
      payload !== null &&
      typeof payload.id === "string" &&
      typeof payload.username === "string" &&
      typeof payload.isAdmin === "boolean"
    ) {
      return {
        id: payload.id,
        username: payload.username,
        avatar: typeof payload.avatar === "string" ? payload.avatar : null,
        isAdmin: payload.isAdmin,
      };
    }
    return null;
  } catch {
    return null;
  }
}
