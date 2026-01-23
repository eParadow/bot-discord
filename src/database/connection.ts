import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure the data directory exists
    const dbDir = path.dirname(config.databasePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(config.databasePath);
    db.pragma('journal_mode = WAL');
    
    initializeSchema();
  }
  return db;
}

function initializeSchema(): void {
  const database = db!;
  
  // Check if reminders table exists and has old schema
  let needsMigration = false;
  try {
    const tableInfo = database.prepare("PRAGMA table_info(reminders)").all() as any[];
    const hasChannelId = tableInfo.some((col: any) => col.name === 'channel_id');
    const hasUserId = tableInfo.some((col: any) => col.name === 'user_id');
    
    if (hasChannelId && !hasUserId) {
      needsMigration = true;
    }
  } catch (e) {
    // Table doesn't exist yet, will be created with new schema
  }
  
  // Create table with new schema (or if it doesn't exist)
  database.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      cron_expression TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Migrate from channel_id to user_id for existing databases
  if (needsMigration) {
    try {
      // Add user_id column
      database.exec(`ALTER TABLE reminders ADD COLUMN user_id TEXT`);
      // Migrate data: use created_by as default user_id (the person who created the reminder)
      database.exec(`UPDATE reminders SET user_id = created_by WHERE user_id IS NULL`);
      console.log('[DB] Migration: channel_id → user_id effectuée');
    } catch (e) {
      console.error('[DB] Erreur lors de la migration:', e);
    }
  }

  // Create index for faster guild lookups
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_reminders_guild_id ON reminders(guild_id)
  `);

  // Activity alerts table
  database.exec(`
    CREATE TABLE IF NOT EXISTS activity_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      alert_user_id TEXT NOT NULL,
      alert_type TEXT NOT NULL CHECK(alert_type IN ('gaming', 'voice', 'both')),
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      message TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_activity_alerts_guild ON activity_alerts(guild_id)
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_activity_alerts_target ON activity_alerts(target_user_id)
  `);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
