import { z } from 'zod';

export const activityAlertCreateSchema = z.object({
  guild_id: z.string().nullable(),
  target_user_id: z.string().min(1),
  alert_user_id: z.string().min(1),
  alert_type: z.enum(['gaming', 'voice', 'both']),
  duration_minutes: z.number().int().positive().default(60),
  message: z.string().nullable().optional(),
});

export const activityAlertUpdateSchema = z.object({
  guild_id: z.string().nullable().optional(),
  target_user_id: z.string().min(1).optional(),
  alert_user_id: z.string().min(1).optional(),
  alert_type: z.enum(['gaming', 'voice', 'both']).optional(),
  duration_minutes: z.number().int().positive().optional(),
  message: z.string().nullable().optional(),
});

export const activityAlertToggleSchema = z.object({
  enabled: z.boolean(),
});

export const activityAlertIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type ActivityAlertCreateInput = z.infer<typeof activityAlertCreateSchema>;
export type ActivityAlertUpdateInput = z.infer<typeof activityAlertUpdateSchema>;
export type ActivityAlertToggleInput = z.infer<typeof activityAlertToggleSchema>;
