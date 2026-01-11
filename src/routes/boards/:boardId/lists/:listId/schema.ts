import { z } from 'zod';

export const listRouteParamsSchema = z.object({
  boardId: z.uuid(),
  listId: z.uuid(),
});

export const updateBoardListSchema = z.object({
  title: z.string().min(1).max(256),
});
