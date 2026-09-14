import { Client, GatewayIntentBits } from "discord.js";
import { env } from "../env.js";

// Used only to look up a logged-in user's roles in the configured guild, server-side.
// No command handling, no message content — just the Guilds intent needed to fetch a
// single known member, which does not require the privileged Server Members intent.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const ready = client.login(env.DISCORD_BOT_TOKEN).then(() => {
  console.log(`Discord bot logged in as ${client.user?.tag}`);
});

/**
 * Returns the role IDs the given Discord user holds in DISCORD_GUILD_ID,
 * or null if they are not a member of that guild.
 */
export async function getMemberRoles(userId: string): Promise<string[] | null> {
  await ready;
  const guild = await client.guilds.fetch(env.DISCORD_GUILD_ID);
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return null;
  return [...member.roles.cache.keys()];
}
