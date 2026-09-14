import { randomBytes } from "node:crypto";
import { Router } from "express";
import { env } from "../env.js";
import { buildAuthorizeUrl, exchangeCodeForToken, fetchDiscordUser } from "../auth/discordOAuth.js";
import { getMemberRoles } from "../auth/discordBot.js";
import { SESSION_COOKIE, signSession, verifySession } from "../auth/session.js";

export const authRouter = Router();

const STATE_COOKIE = "gta_map_oauth_state";
const isProd = env.NODE_ENV === "production";

authRouter.get("/discord/login", (req, res) => {
  const state = randomBytes(16).toString("hex");
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
  });
  res.redirect(buildAuthorizeUrl(state));
});

authRouter.get("/discord/callback", async (req, res) => {
  const { code, state } = req.query;
  const expectedState = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE);

  if (typeof code !== "string" || typeof state !== "string" || !expectedState || state !== expectedState) {
    res.status(400).send("Invalid OAuth state or code");
    return;
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    const discordUser = await fetchDiscordUser(accessToken);
    const roles = await getMemberRoles(discordUser.id);
    const isAdmin = roles !== null && roles.some((roleId) => env.ADMIN_ROLE_IDS.includes(roleId));

    const token = signSession({
      id: discordUser.id,
      username: discordUser.username,
      avatar: discordUser.avatar,
      isAdmin,
    });

    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.redirect("/");
  } catch (error) {
    console.error("Discord OAuth callback failed:", error);
    res.status(502).send("Discord login failed, please try again");
  }
});

authRouter.get("/me", (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  const user = typeof token === "string" ? verifySession(token) : null;
  res.json({ user });
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.status(204).end();
});
