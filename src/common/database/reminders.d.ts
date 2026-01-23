import type { Reminder, ReminderCreate } from '../types';
export declare function createReminder(data: ReminderCreate): Promise<Reminder>;
export declare function getReminderById(id: number): Promise<Reminder | undefined>;
export declare function getRemindersByGuildId(guildId: string): Promise<Reminder[]>;
export declare function getRemindersByUserId(userId: string): Promise<Reminder[]>;
export declare function getAllReminders(): Promise<Reminder[]>;
export declare function deleteReminder(id: number, guildId: string | null, userId?: string): Promise<boolean>;
export declare function deleteReminderById(id: number): Promise<boolean>;
//# sourceMappingURL=reminders.d.ts.map