import { z } from 'zod';

export const boardIdParamsSchema = z.object({
  boardId: z.uuid(),
});
