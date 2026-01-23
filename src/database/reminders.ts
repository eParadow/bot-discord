import { getDatabase } from './connection';
import type { Reminder, ReminderCreate } from '../types';

export function createReminder(data: ReminderCreate): Reminder {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    INSERT INTO reminders (guild_id, user_id, message, cron_expression, created_by)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.guild_id,
    data.user_id,
    data.message,
    data.cron_expression,
    data.created_by
  );
  
  return getReminderById(result.lastInsertRowid as number)!;
}

export function getReminderById(id: number): Reminder | undefined {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM reminders WHERE id = ?');
  return stmt.get(id) as Reminder | undefined;
}

export function getRemindersByGuildId(guildId: string): Reminder[] {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM reminders WHERE guild_id = ? ORDER BY created_at DESC');
  return stmt.all(guildId) as Reminder[];
}

export function getAllReminders(): Reminder[] {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM reminders ORDER BY id');
  return stmt.all() as Reminder[];
}

export function deleteReminder(id: number, guildId: string): boolean {
  const db = getDatabase();
  
  const stmt = db.prepare('DELETE FROM reminders WHERE id = ? AND guild_id = ?');
  const result = stmt.run(id, guildId);
  
  return result.changes > 0;
}

export function deleteReminderById(id: number): boolean {
  const db = getDatabase();
  
  const stmt = db.prepare('DELETE FROM reminders WHERE id = ?');
  const result = stmt.run(id);
  
  return result.changes > 0;
}
