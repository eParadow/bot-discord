import { z } from 'zod';

export const userCreateSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
});

export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
