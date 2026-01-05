import { z } from 'zod';
import { boardIdParamsSchema } from '../../schema';

export const deleteBoardMemberParamsSchema = boardIdParamsSchema.extend({
  userId: z.uuid(),
});
