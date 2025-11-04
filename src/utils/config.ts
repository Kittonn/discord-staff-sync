import { config } from "dotenv";
import { BotConfig } from "../types";

config();

export function loadConfig(): BotConfig {
  const token = process.env.DISCORD_BOT_TOKEN;
  const serverAId = process.env.SERVER_A_ID;
  const serverBId = process.env.SERVER_B_ID;
  const logLevel = (process.env.LOG_LEVEL || "info") as BotConfig["logLevel"];

  if (!token) {
    throw new Error("DISCORD_BOT_TOKEN is required in .env file");
  }

  if (!serverAId) {
    throw new Error("SERVER_A_ID is required in .env file");
  }

  if (!serverBId) {
    throw new Error("SERVER_B_ID is required in .env file");
  }

  return {
    token,
    serverAId,
    serverBId,
    logLevel,
  };
}

export const STAFF_ROLE_NAME = "Staff";
