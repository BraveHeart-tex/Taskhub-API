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

export const moveCardParamsSchema = z.object({
  boardId: z.uuid(),
  cardId: z.uuid(),
});

export const moveCardBodySchema = z.object({
  targetListId: z.uuid(),
  beforeCardId: z.uuid().optional(),
  afterCardId: z.uuid().optional(),
});
