import z from 'zod';
import {
  MAX_CARD_DESCRIPTION_LENGTH,
  MAX_CARD_TITLE_LENGTH,
  MIN_CARD_TITLE_LENGTH,
} from '@/domain/card/card.constants';

export const createCardSchema = z.object({
  title: z.string().min(MIN_CARD_TITLE_LENGTH).max(MAX_CARD_TITLE_LENGTH),
  description: z.string().max(MAX_CARD_DESCRIPTION_LENGTH).optional(),
});

export const cardDtoSchema = z.object({
  id: z.uuid(),
  title: z.string().min(MIN_CARD_TITLE_LENGTH).max(MAX_CARD_TITLE_LENGTH),
  description: z.string().max(MAX_CARD_DESCRIPTION_LENGTH).nullable(),
  listId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  position: z.number().min(0),
});
