import { LogLevel } from "../types";

export class Logger {
  private static logLevel: LogLevel = "info";

  static setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private static shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  private static formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  static debug(message: string): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message));
    }
  }

  static info(message: string): void {
    if (this.shouldLog("info")) {
      console.log(this.formatMessage("info", message));
    }
  }

  static warn(message: string): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message));
    }
  }

  static error(message: string): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message));
    }
  }
}
