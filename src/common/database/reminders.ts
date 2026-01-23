import { getDatabase } from './connection';
import type { Reminder, ReminderCreate } from '../types';

export async function createReminder(data: ReminderCreate): Promise<Reminder> {
  const db = getDatabase();
  
  const result = await db('reminders')
    .insert({
      guild_id: data.guild_id,
      user_id: data.user_id,
      message: data.message,
      cron_expression: data.cron_expression,
      created_by: data.created_by,
    })
    .returning('id');
  
  const id = result[0].id;
  return (await getReminderById(id))!;
}

export async function getReminderById(id: number): Promise<Reminder | undefined> {
  const db = getDatabase();
  
  return await db('reminders')
    .where('id', id)
    .first() as Reminder | undefined;
}

export async function getRemindersByGuildId(guildId: string): Promise<Reminder[]> {
  const db = getDatabase();
  
  return await db('reminders')
    .where('guild_id', guildId)
    .orderBy('created_at', 'desc') as Reminder[];
}

export async function getRemindersByUserId(userId: string): Promise<Reminder[]> {
  const db = getDatabase();
  
  return await db('reminders')
    .where('user_id', userId)
    .whereNull('guild_id')
    .orderBy('created_at', 'desc') as Reminder[];
}

export async function getAllReminders(): Promise<Reminder[]> {
  const db = getDatabase();
  
  return await db('reminders')
    .orderBy('id') as Reminder[];
}

export async function deleteReminder(id: number, guildId: string | null, userId?: string): Promise<boolean> {
  const db = getDatabase();
  
  let query = db('reminders').where('id', id);
  
  if (guildId === null && userId) {
    // Pour les DMs, vérifier que le rappel appartient à l'utilisateur
    query = query.whereNull('guild_id').where('user_id', userId);
  } else if (guildId !== null) {
    // Pour les serveurs, vérifier le guild_id
    query = query.where('guild_id', guildId);
  }
  
  const deleted = await query.delete();
  
  return deleted > 0;
}

export async function deleteReminderById(id: number): Promise<boolean> {
  const db = getDatabase();
  
  const deleted = await db('reminders')
    .where('id', id)
    .delete();
  
  return deleted > 0;
}
