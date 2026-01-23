export interface Reminder {
  id: number;
  guild_id: string | null;
  user_id: string;
  message: string;
  cron_expression: string;
  created_by: string;
  created_at: string;
}

export interface ReminderCreate {
  guild_id: string | null;
  user_id: string;
  message: string;
  cron_expression: string;
  created_by: string;
}

// Activity Alert Types
export type AlertType = 'gaming' | 'voice' | 'both';

export interface ActivityAlert {
  id: number;
  guild_id: string | null;
  target_user_id: string;
  alert_user_id: string;
  alert_type: AlertType;
  duration_minutes: number;
  message: string | null;
  enabled: boolean;
  created_at: string;
}

export interface ActivityAlertCreate {
  guild_id: string | null;
  target_user_id: string;
  alert_user_id: string;
  alert_type: AlertType;
  duration_minutes: number;
  message: string | null;
}

// Tracking state (in-memory)
export interface UserActivityState {
  userId: string;
  gamingStartedAt: number | null;
  voiceStartedAt: number | null;
  gamingAlertSent: Set<number>; // Alert IDs already sent for this session
  voiceAlertSent: Set<number>;
}
