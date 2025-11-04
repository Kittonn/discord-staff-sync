import { GuildMember } from "discord.js";
import { BotConfig } from "../types";
import { RoleSyncService } from "../services/roleSync";
import { Logger } from "../utils/logger";

export function handleGuildMemberAdd(
  roleSyncService: RoleSyncService,
  config: BotConfig,
) {
  return async (member: GuildMember) => {
    if (member.guild.id !== config.serverBId) {
      return;
    }

    Logger.info(
      `👋 User ${member.user.tag} joined Server B (${member.guild.name})`,
    );

    try {
      const result = await roleSyncService.syncStaffRole(member.id);

      if (result.success) {
        if (result.action === "added") {
          Logger.info(
            `✅ Added Staff role to ${member.user.tag} after joining Server B`,
          );
        } else if (result.action === "no_change") {
          Logger.debug(
            `📋 No Staff role sync needed for ${member.user.tag}`,
          );
        }
      } else {
        Logger.warn(
          `❌ Failed to sync Staff role for ${member.user.tag}: ${result.error}`,
        );
      }
    } catch (error) {
      Logger.error(
        `❌ Error handling member join for ${member.user.tag}: ${error}`,
      );
    }
  };
}
