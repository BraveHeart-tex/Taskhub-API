import { z } from 'zod';

export const listSchema = z.object({
  id: z.uuid(),
  boardId: z.uuid(),
  title: z.string().min(1).max(100),
  position: z.number().min(0),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const createListBodySchema = z.object({
  title: z.string().min(1).max(100),
});
