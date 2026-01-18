import { getDatabase } from './connection';
import type { ActivityAlert, ActivityAlertCreate } from '../types';

export function createActivityAlert(data: ActivityAlertCreate): ActivityAlert {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    INSERT INTO activity_alerts (guild_id, target_user_id, alert_user_id, alert_type, duration_minutes, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.guild_id,
    data.target_user_id,
    data.alert_user_id,
    data.alert_type,
    data.duration_minutes,
    data.message
  );
  
  return getActivityAlertById(result.lastInsertRowid as number)!;
}

export function getActivityAlertById(id: number): ActivityAlert | undefined {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM activity_alerts WHERE id = ?');
  const row = stmt.get(id) as any;
  
  if (!row) return undefined;
  
  return {
    ...row,
    enabled: Boolean(row.enabled),
  };
}

export function getActivityAlertsByGuildId(guildId: string): ActivityAlert[] {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM activity_alerts WHERE guild_id = ? ORDER BY created_at DESC');
  const rows = stmt.all(guildId) as any[];
  
  return rows.map(row => ({
    ...row,
    enabled: Boolean(row.enabled),
  }));
}

export function getActivityAlertsByTargetUser(targetUserId: string): ActivityAlert[] {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM activity_alerts WHERE target_user_id = ? AND enabled = 1');
  const rows = stmt.all(targetUserId) as any[];
  
  return rows.map(row => ({
    ...row,
    enabled: Boolean(row.enabled),
  }));
}

export function getAllEnabledActivityAlerts(): ActivityAlert[] {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM activity_alerts WHERE enabled = 1');
  const rows = stmt.all() as any[];
  
  return rows.map(row => ({
    ...row,
    enabled: Boolean(row.enabled),
  }));
}

export function deleteActivityAlert(id: number, guildId: string): boolean {
  const db = getDatabase();
  
  const stmt = db.prepare('DELETE FROM activity_alerts WHERE id = ? AND guild_id = ?');
  const result = stmt.run(id, guildId);
  
  return result.changes > 0;
}

export function toggleActivityAlert(id: number, guildId: string, enabled: boolean): boolean {
  const db = getDatabase();
  
  const stmt = db.prepare('UPDATE activity_alerts SET enabled = ? WHERE id = ? AND guild_id = ?');
  const result = stmt.run(enabled ? 1 : 0, id, guildId);
  
  return result.changes > 0;
}
