import { z } from 'zod';
import {
  MAX_CARD_DESCRIPTION_LENGTH,
  MAX_CARD_TITLE_LENGTH,
  MIN_CARD_TITLE_LENGTH,
} from '@/domain/card/card.constants';

export const cardRouteParamsSchema = z.object({
  boardId: z.uuid(),
  listId: z.uuid(),
  cardId: z.uuid(),
});

export const cardUpdateBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(MIN_CARD_TITLE_LENGTH)
      .max(MAX_CARD_TITLE_LENGTH)
      .optional(),
    description: z.string().trim().max(MAX_CARD_DESCRIPTION_LENGTH).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.title && !data.description) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one field must be provided',
      });
    }
  });

export const cardDtoSchema = z.object({
  id: z.uuid(),
  listId: z.uuid(),
  title: z.string().min(MIN_CARD_TITLE_LENGTH).max(MAX_CARD_TITLE_LENGTH),
  description: z.string().max(MAX_CARD_DESCRIPTION_LENGTH).nullable(),
  position: z.string(),
  createdBy: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
