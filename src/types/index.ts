export interface Reminder {
  id: number;
  guild_id: string;
  channel_id: string;
  message: string;
  cron_expression: string;
  created_by: string;
  created_at: string;
}

export interface ReminderCreate {
  guild_id: string;
  channel_id: string;
  message: string;
  cron_expression: string;
  created_by: string;
}
