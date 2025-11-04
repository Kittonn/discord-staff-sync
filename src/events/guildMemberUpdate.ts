import { GuildMember, PartialGuildMember } from "discord.js";
import { BotConfig } from "../types";
import { RoleSyncService } from "../services/roleSync";
import { Logger } from "../utils/logger";

export function handleGuildMemberUpdate(
  roleSyncService: RoleSyncService,
  config: BotConfig,
) {
  return async (
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
  ) => {
    if (newMember.guild.id !== config.serverAId) {
      return;
    }

    const oldHadStaff = oldMember.roles?.cache.some(
      (role) => role.name.toLowerCase() === "staff",
    );
    const newHasStaff = newMember.roles.cache.some(
      (role) => role.name.toLowerCase() === "staff",
    );

    if (oldHadStaff === newHasStaff) {
      return;
    }

    const action = newHasStaff ? "added" : "removed";
    Logger.info(
      `🔄 Staff role ${action} for ${newMember.user.tag} in Server A`,
    );

    try {
      const result = await roleSyncService.syncStaffRole(newMember.id);

      if (result.success) {
        if (result.action === "added") {
          Logger.info(
            `✅ Added Staff role to ${newMember.user.tag} in Server B`,
          );
        } else if (result.action === "removed") {
          Logger.info(
            `🗑️  Removed Staff role from ${newMember.user.tag} in Server B`,
          );
        } else if (result.action === "no_change") {
          Logger.debug(
            `📋 No Staff role sync needed for ${newMember.user.tag}`,
          );
        }
      } else {
        Logger.warn(
          `❌ Failed to sync Staff role for ${newMember.user.tag}: ${result.error}`,
        );
      }
    } catch (error) {
      Logger.error(
        `❌ Error handling Staff role update for ${newMember.user.tag}: ${error}`,
      );
    }
  };
}
