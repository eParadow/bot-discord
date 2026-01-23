import { getDatabase } from './connection';
import type { ActivityAlert, ActivityAlertCreate } from '../types';

export async function createActivityAlert(data: ActivityAlertCreate): Promise<ActivityAlert> {
  const db = getDatabase();
  
  const result = await db('activity_alerts')
    .insert({
      guild_id: data.guild_id,
      target_user_id: data.target_user_id,
      alert_user_id: data.alert_user_id,
      alert_type: data.alert_type,
      duration_minutes: data.duration_minutes,
      message: data.message,
    })
    .returning('id');
  
  const id = result[0].id;
  return (await getActivityAlertById(id))!;
}

export async function getActivityAlertById(id: number): Promise<ActivityAlert | undefined> {
  const db = getDatabase();
  
  return await db('activity_alerts')
    .where('id', id)
    .first() as ActivityAlert | undefined;
}

export async function getActivityAlertsByGuildId(guildId: string): Promise<ActivityAlert[]> {
  const db = getDatabase();
  
  return await db('activity_alerts')
    .where('guild_id', guildId)
    .orderBy('created_at', 'desc') as ActivityAlert[];
}

export async function getActivityAlertsByTargetUser(targetUserId: string): Promise<ActivityAlert[]> {
  const db = getDatabase();
  
  return await db('activity_alerts')
    .where('target_user_id', targetUserId)
    .where('enabled', true) as ActivityAlert[];
}

export async function getAllEnabledActivityAlerts(): Promise<ActivityAlert[]> {
  const db = getDatabase();
  
  return await db('activity_alerts')
    .where('enabled', true) as ActivityAlert[];
}

export async function deleteActivityAlert(id: number, guildId: string): Promise<boolean> {
  const db = getDatabase();
  
  const deleted = await db('activity_alerts')
    .where({ id, guild_id: guildId })
    .delete();
  
  return deleted > 0;
}

export async function toggleActivityAlert(id: number, guildId: string, enabled: boolean): Promise<boolean> {
  const db = getDatabase();
  
  const updated = await db('activity_alerts')
    .where({ id, guild_id: guildId })
    .update({ enabled });
  
  return updated > 0;
}
