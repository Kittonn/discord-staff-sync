export interface BotConfig {
  token: string;
  serverAId: string;
  serverBId: string;
  logLevel: "debug" | "info" | "warn" | "error";
}

export interface SyncResult {
  success: boolean;
  userId: string;
  username: string;
  action: "added" | "removed" | "no_change" | "error";
  error?: string;
}

export interface StaffRoleSync {
  hasStaffInServerA: boolean;
  hasStaffInServerB: boolean;
  needsSync: boolean;
}

export type LogLevel = "debug" | "info" | "warn" | "error";
