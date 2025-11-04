# Discord Staff Role Sync Bot

A Discord bot that automatically syncs the "Staff" role between two servers using discord.js v14+ and TypeScript.

## Features

- Syncs "Staff" role when users join Server B
- Syncs "Staff" role when roles are added/removed in Server A
- Automatic synchronization on startup for all existing members
- Clean modular structure
- Comprehensive logging with emoji indicators
- TypeScript support
- Easy to extend for additional roles

## Prerequisites

- Node.js 16+ 
- Discord bot with proper permissions in both servers
- Bot token from Discord Developer Portal

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env file:**
   ```
   DISCORD_BOT_TOKEN=your_bot_token_here
   SERVER_A_ID=your_server_a_id_here
   SERVER_B_ID=your_server_b_id_here
   LOG_LEVEL=info
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Run the bot:**
   ```bash
   npm start
   ```

For development:
```bash
npm run dev
```

## Bot Permissions

The bot needs the following permissions in both servers:
- View Server Members
- Manage Roles (for Server B)
- Read Messages/View Channels

## How It Works

1. **Initial Sync:** When the bot starts, it performs a full synchronization of all members from Server A to Server B
2. **Existing Member Check:** After initial sync, it checks all existing members in Server B for proper Staff role assignment
3. **Member Join:** When a user joins Server B, it checks their Staff role in Server A and syncs accordingly
4. **Role Updates:** When the Staff role is added or removed in Server A, it automatically updates Server B

## Project Structure

```
src/
├── events/          # Discord event handlers
│   ├── guildMemberAdd.ts      # Handles member joins in Server B
│   └── guildMemberUpdate.ts   # Handles role changes in Server A
├── services/        # Core business logic
│   └── roleSync.ts            # Staff role synchronization logic
├── utils/           # Utility functions
│   ├── config.ts              # Configuration loader
│   └── logger.ts              # Logging utility with levels
├── types/           # TypeScript interfaces
│   └── index.ts               # Type definitions
└── index.ts         # Main bot entry point
```

## Configuration Options

- `LOG_LEVEL`: Control log verbosity (debug, info, warn, error)
  - `debug`: Shows all logs including detailed sync operations
  - `info`: Shows general operations and sync results (default)
  - `warn`: Shows warnings and errors only
  - `error`: Shows errors only

## Extending for More Roles

To sync additional roles beyond "Staff":

1. **Update types** (`src/types/index.ts`):
   ```typescript
   export interface BotConfig {
     // Add syncedRoles array
     syncedRoles: string[];
     logLevel: "debug" | "info" | "warn" | "error";
   }
   ```

2. **Update configuration** (`src/utils/config.ts`):
   ```typescript
   // Load SYNCED_ROLES from environment
   const syncedRolesEnv = process.env.SYNCED_ROLES;
   const syncedRoles = syncedRolesEnv.split(',').map(r => r.trim());
   ```

3. **Update .env**:
   ```
   SYNCED_ROLES=Staff,Moderator,Admin
   ```

4. **Modify service** (`src/services/roleSync.ts`):
   - Replace `syncStaffRole()` with a generic `syncRole()` function
   - Update `syncAllStaffRoles()` to iterate through all synced roles
   - Modify event handlers to work with multiple roles

## Logs

The bot provides comprehensive logging with emoji indicators:

- 🤖 Bot status and configuration
- 🚀 Synchronization processes
- ✅ Successful role additions
- 🗑️ Successful role removals
- 📋 No-change operations (debug mode)
- ❌ Errors and failures
- 👋 Member join events
- 🔄 Role change events

Example logs:
```
[2024-01-15T10:30:00.000Z] [INFO] ✅ Bot logged in as StaffSync#1234
[2024-01-15T10:30:01.000Z] [INFO] 🚀 Starting initial Staff role synchronization...
[2024-01-15T10:30:05.000Z] [INFO] ✅ Added Staff role to JohnDoe in Community Server
[2024-01-15T10:30:05.000Z] [INFO] ✅ Full synchronization completed. Added: 3, Removed: 1, Errors: 0
```

## Troubleshooting

- **Bot permissions missing**: Ensure the bot has "Manage Roles" permission in Server B
- **Role not found**: Verify the "Staff" role exists in both servers with exact spelling
- **Server ID incorrect**: Right-click server icon → Copy Server ID (enable Developer Mode)
- **Token issues**: Regenerate bot token in Discord Developer Portal
- **Rate limits**: Discord has rate limits; the bot will retry automatically

## Development

- `npm run build`: Compile TypeScript to JavaScript
- `npm run watch`: Watch for changes and auto-compile
- `npm run dev`: Run bot directly from TypeScript (development)

The bot is designed to be production-ready with proper error handling, logging, and graceful shutdown procedures.