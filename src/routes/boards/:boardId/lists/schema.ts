import { z } from 'zod';
import {
  MAX_LIST_TITLE_LENGTH,
  MIN_LIST_TITLE_LENGTH,
} from '@/domain/board/list/list.constants';

export const listSchema = z.object({
  id: z.uuid(),
  boardId: z.uuid(),
  title: z
    .string()
    .trim()
    .min(MIN_LIST_TITLE_LENGTH)
    .max(MAX_LIST_TITLE_LENGTH),
  position: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const createListBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(MIN_LIST_TITLE_LENGTH)
    .max(MAX_LIST_TITLE_LENGTH),
});
