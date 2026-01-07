import { z } from 'zod';

export const boardListPathParamsSchema = z.object({
  boardId: z.uuid(),
  listId: z.uuid(),
});

export const updateBoardListSchema = z.object({
  title: z.string().min(1).max(100),
});
