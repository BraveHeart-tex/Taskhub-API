import { z } from 'zod';

export const boardFavoriteParamsSchema = z.object({
  boardId: z.uuid(),
});
