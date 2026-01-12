import { z } from 'zod';

export const reOrderListDtoSchema = z.object({
  listId: z.uuid(),
});
