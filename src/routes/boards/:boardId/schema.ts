import { z } from 'zod';

export const boardRouteParamsSchema = z.object({
  boardId: z.uuid(),
});
