import { z } from 'zod';

export const cardRouteParamsSchema = z.object({
  boardId: z.uuid(),
  listId: z.uuid(),
  cardId: z.uuid(),
});
