import { Client, GatewayIntentBits, Events } from "discord.js";
import { loadConfig } from "./utils/config";
import { Logger } from "./utils/logger";
import { RoleSyncService } from "./services/roleSync";
import { handleGuildMemberAdd } from "./events/guildMemberAdd";
import { handleGuildMemberUpdate } from "./events/guildMemberUpdate";

async function main() {
  try {
    const config = loadConfig();
    Logger.setLogLevel(config.logLevel);
    Logger.info("🤖 Configuration loaded successfully");
    Logger.info(`📋 Log level set to: ${config.logLevel}`);

    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });

    const roleSyncService = new RoleSyncService(client, config);

    client.once(Events.ClientReady, async (readyClient) => {
      Logger.info(`✅ Bot logged in as ${readyClient.user.tag}`);
      Logger.info(
        "🎉 Bot is ready and monitoring for member joins and role changes!",
      );
      Logger.info(
        "🔄 Auto-sync is disabled - will only sync on member join and role updates",
      );
    });

    client.on(
      Events.GuildMemberAdd,
      handleGuildMemberAdd(roleSyncService, config),
    );

    client.on(
      Events.GuildMemberUpdate,
      handleGuildMemberUpdate(roleSyncService, config),
    );

    client.on(Events.Error, (error) => {
      Logger.error(`❌ Discord client error: ${error}`);
    });

    process.on("unhandledRejection", (error) => {
      Logger.error(`❌ Unhandled promise rejection: ${error}`);
    });

    process.on("uncaughtException", (error) => {
      Logger.error(`❌ Uncaught exception: ${error}`);
      process.exit(1);
    });

    await client.login(config.token);
  } catch (error) {
    Logger.error(`❌ Failed to start bot: ${error}`);
    process.exit(1);
  }
}

main();
