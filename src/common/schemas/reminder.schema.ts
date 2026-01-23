import { z } from 'zod';

export const reminderCreateSchema = z.object({
  guild_id: z.string().nullable(),
  user_id: z.string().min(1),
  message: z.string().min(1),
  cron_expression: z.string().min(1),
  created_by: z.string().min(1),
});

export const reminderUpdateSchema = z.object({
  guild_id: z.string().nullable().optional(),
  user_id: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  cron_expression: z.string().min(1).optional(),
  created_by: z.string().min(1).optional(),
});

export const reminderIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type ReminderCreateInput = z.infer<typeof reminderCreateSchema>;
export type ReminderUpdateInput = z.infer<typeof reminderUpdateSchema>;
