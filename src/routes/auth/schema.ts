import z from 'zod';

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(256),
});

export const authenticatedUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  createdAt: z.date(),
});
