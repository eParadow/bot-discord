import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const jwtPayloadSchema = z.object({
  userId: z.number(),
  username: z.string(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type JWTPayloadInput = z.infer<typeof jwtPayloadSchema>;
