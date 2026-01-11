import { z } from 'zod';
import { boardRouteParamsSchema } from '../../schema';

export const deleteBoardMemberParamsSchema = boardRouteParamsSchema.extend({
  userId: z.uuid(),
});
