import cron, { ScheduledTask } from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import type { Reminder } from '../types';
import { getAllReminders } from '../database/reminders';

// Store active cron tasks by reminder ID
const activeTasks: Map<number, ScheduledTask> = new Map();

export function scheduleReminder(reminder: Reminder, client: Client): void {
  // If there's already a task for this reminder, stop it first
  unscheduleReminder(reminder.id);

  const task = cron.schedule(reminder.cron_expression, async () => {
    try {
      const channel = await client.channels.fetch(reminder.channel_id);
      
      if (channel && channel instanceof TextChannel) {
        await channel.send(reminder.message);
        console.log(`[CRON] Rappel #${reminder.id} envoyé dans #${channel.name}`);
      } else {
        console.error(`[CRON] Channel ${reminder.channel_id} not found or not a text channel`);
      }
    } catch (error) {
      console.error(`[CRON] Error sending reminder #${reminder.id}:`, error);
    }
  });

  activeTasks.set(reminder.id, task);
  console.log(`[CRON] Rappel #${reminder.id} programmé: ${reminder.cron_expression}`);
}

export function unscheduleReminder(id: number): void {
  const task = activeTasks.get(id);
  if (task) {
    task.stop();
    activeTasks.delete(id);
    console.log(`[CRON] Rappel #${id} déprogrammé`);
  }
}

export function loadAllReminders(client: Client): void {
  const reminders = getAllReminders();
  
  console.log(`[CRON] Chargement de ${reminders.length} rappel(s)...`);
  
  for (const reminder of reminders) {
    try {
      scheduleReminder(reminder, client);
    } catch (error) {
      console.error(`[CRON] Erreur lors du chargement du rappel #${reminder.id}:`, error);
    }
  }
  
  console.log(`[CRON] ${activeTasks.size} rappel(s) actif(s)`);
}

export function stopAllReminders(): void {
  for (const [id, task] of activeTasks) {
    task.stop();
    console.log(`[CRON] Rappel #${id} arrêté`);
  }
  activeTasks.clear();
}

export function getActiveTasksCount(): number {
  return activeTasks.size;
}
