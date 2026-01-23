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

export async function getActivityAlertsByUserId(userId: string): Promise<ActivityAlert[]> {
  const db = getDatabase();
  
  return await db('activity_alerts')
    .where('alert_user_id', userId)
    .whereNull('guild_id')
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

export async function deleteActivityAlert(id: number, guildId: string | null, userId?: string): Promise<boolean> {
  const db = getDatabase();
  
  let query = db('activity_alerts').where('id', id);
  
  if (guildId === null && userId) {
    // Pour les DMs, vérifier que l'alerte appartient à l'utilisateur
    query = query.whereNull('guild_id').where('alert_user_id', userId);
  } else if (guildId !== null) {
    // Pour les serveurs, vérifier le guild_id
    query = query.where('guild_id', guildId);
  }
  
  const deleted = await query.delete();
  
  return deleted > 0;
}

export async function toggleActivityAlert(id: number, guildId: string | null, enabled: boolean, userId?: string): Promise<boolean> {
  const db = getDatabase();
  
  let query = db('activity_alerts').where('id', id);
  
  if (guildId === null && userId) {
    // Pour les DMs, vérifier que l'alerte appartient à l'utilisateur
    query = query.whereNull('guild_id').where('alert_user_id', userId);
  } else if (guildId !== null) {
    // Pour les serveurs, vérifier le guild_id
    query = query.where('guild_id', guildId);
  }
  
  const updated = await query.update({ enabled });
  
  return updated > 0;
}
