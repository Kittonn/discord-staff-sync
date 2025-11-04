import { Client, Guild, GuildMember, Role } from "discord.js";
import { BotConfig, SyncResult, StaffRoleSync } from "../types";
import { Logger } from "../utils/logger";
import { STAFF_ROLE_NAME } from "../utils/config";

export class RoleSyncService {
  private client: Client;
  private config: BotConfig;

  constructor(client: Client, config: BotConfig) {
    this.client = client;
    this.config = config;
  }

  private async getServer(guildId: string): Promise<Guild | null> {
    try {
      const guild = await this.client.guilds.fetch(guildId);
      if (!guild) {
        Logger.error(`Guild ${guildId} not found`);
        return null;
      }
      return guild;
    } catch (error) {
      Logger.error(`Failed to fetch guild ${guildId}: ${error}`);
      return null;
    }
  }

  private findStaffRole(guild: Guild): Role | null {
    const role = guild.roles.cache.find(
      (r) => r.name.toLowerCase() === STAFF_ROLE_NAME.toLowerCase(),
    );
    return role || null;
  }

  private async getMemberInServer(
    guild: Guild,
    userId: string,
  ): Promise<GuildMember | null> {
    try {
      const member = await guild.members.fetch(userId);
      return member;
    } catch (error) {
      Logger.debug(`Member ${userId} not found in guild ${guild.id}: ${error}`);
      return null;
    }
  }

  private hasStaffRole(member: GuildMember): boolean {
    return member.roles.cache.some(
      (role) => role.name.toLowerCase() === STAFF_ROLE_NAME.toLowerCase(),
    );
  }

  private async addStaffRole(
    member: GuildMember,
    role: Role,
  ): Promise<boolean> {
    try {
      if (member.roles.cache.has(role.id)) {
        Logger.debug(`Member ${member.user.tag} already has Staff role`);
        return true;
      }
      await member.roles.add(role);
      Logger.info(
        `✅ Added Staff role to ${member.user.tag} in ${member.guild.name}`,
      );
      return true;
    } catch (error) {
      Logger.error(
        `❌ Failed to add Staff role to ${member.user.tag}: ${error}`,
      );
      return false;
    }
  }

  private async removeStaffRole(
    member: GuildMember,
    role: Role,
  ): Promise<boolean> {
    try {
      if (!member.roles.cache.has(role.id)) {
        Logger.debug(`Member ${member.user.tag} does not have Staff role`);
        return true;
      }
      await member.roles.remove(role);
      Logger.info(
        `🗑️  Removed Staff role from ${member.user.tag} in ${member.guild.name}`,
      );
      return true;
    } catch (error) {
      Logger.error(
        `❌ Failed to remove Staff role from ${member.user.tag}: ${error}`,
      );
      return false;
    }
  }

  private analyzeStaffSync(
    memberA: GuildMember | null,
    memberB: GuildMember | null,
  ): StaffRoleSync {
    const hasStaffInServerA = memberA ? this.hasStaffRole(memberA) : false;
    const hasStaffInServerB = memberB ? this.hasStaffRole(memberB) : false;
    const needsSync = hasStaffInServerA !== hasStaffInServerB;

    return {
      hasStaffInServerA,
      hasStaffInServerB,
      needsSync,
    };
  }

  public async syncStaffRole(userId: string): Promise<SyncResult> {
    const serverA = await this.getServer(this.config.serverAId);
    const serverB = await this.getServer(this.config.serverBId);

    if (!serverA || !serverB) {
      const error = "Could not fetch one or both servers";
      Logger.error(error);
      return {
        success: false,
        userId,
        username: "unknown",
        action: "error",
        error,
      };
    }

    const memberA = await this.getMemberInServer(serverA, userId);
    const memberB = await this.getMemberInServer(serverB, userId);

    if (!memberA || !memberB) {
      const error = `Member ${userId} not found in one or both servers`;
      Logger.warn(error);
      return {
        success: false,
        userId,
        username: memberA?.user.tag || memberB?.user.tag || "unknown",
        action: "error",
        error,
      };
    }

    const staffRoleInServerB = this.findStaffRole(serverB);
    if (!staffRoleInServerB) {
      const error = `Staff role not found in server ${serverB.name}`;
      Logger.warn(error);
      return {
        success: false,
        userId,
        username: memberA.user.tag,
        action: "error",
        error,
      };
    }

    const syncAnalysis = this.analyzeStaffSync(memberA, memberB);

    if (!syncAnalysis.needsSync) {
      Logger.debug(`📋 No Staff role sync needed for ${memberA.user.tag}`);
      return {
        success: true,
        userId,
        username: memberA.user.tag,
        action: "no_change",
      };
    }

    if (syncAnalysis.hasStaffInServerA && !syncAnalysis.hasStaffInServerB) {
      const success = await this.addStaffRole(memberB, staffRoleInServerB);
      return {
        success,
        userId,
        username: memberA.user.tag,
        action: success ? "added" : "error",
        error: success ? undefined : "Failed to add Staff role",
      };
    } else if (
      !syncAnalysis.hasStaffInServerA &&
      syncAnalysis.hasStaffInServerB
    ) {
      const success = await this.removeStaffRole(memberB, staffRoleInServerB);
      return {
        success,
        userId,
        username: memberA.user.tag,
        action: success ? "removed" : "error",
        error: success ? undefined : "Failed to remove Staff role",
      };
    }

    return {
      success: true,
      userId,
      username: memberA.user.tag,
      action: "no_change",
    };
  }

  public async syncAllStaffRoles(): Promise<void> {
    Logger.info("🚀 Starting full Staff role synchronization...");
    const serverA = await this.getServer(this.config.serverAId);
    const serverB = await this.getServer(this.config.serverBId);

    if (!serverA || !serverB) {
      Logger.error("Could not fetch servers for full sync");
      return;
    }

    try {
      await serverA.members.fetch();
      await serverB.members.fetch();

      const membersA = serverA.members.cache;
      let addedCount = 0;
      let removedCount = 0;
      let errorCount = 0;

      for (const [_, member] of membersA) {
        const result = await this.syncStaffRole(member.id);

        if (result.success) {
          if (result.action === "added") addedCount++;
          else if (result.action === "removed") removedCount++;
        } else {
          errorCount++;
        }
      }

      Logger.info(
        `✅ Full synchronization completed. Added: ${addedCount}, Removed: ${removedCount}, Errors: ${errorCount}`,
      );
    } catch (error) {
      Logger.error(`Error during full sync: ${error}`);
    }
  }

  public async syncExistingMembersInServerB(): Promise<void> {
    Logger.info("🔄 Syncing existing members in Server B...");
    const serverB = await this.getServer(this.config.serverBId);

    if (!serverB) {
      Logger.error("Could not fetch Server B for existing member sync");
      return;
    }

    try {
      await serverB.members.fetch();
      const membersB = serverB.members.cache;

      let syncCount = 0;
      for (const [_, member] of membersB) {
        const result = await this.syncStaffRole(member.id);
        if (
          result.success &&
          (result.action === "added" || result.action === "removed")
        ) {
          syncCount++;
        }
      }

      Logger.info(
        `✅ Existing member sync completed. Synced ${syncCount} members.`,
      );
    } catch (error) {
      Logger.error(`Error during existing member sync: ${error}`);
    }
  }
}
