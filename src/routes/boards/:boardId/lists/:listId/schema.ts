import { z } from 'zod';
import {
  MAX_BOARD_TITLE_LENGTH,
  MIN_BOARD_TITLE_LENGTH,
} from '@/domain/board/board.consants';

export const listRouteParamsSchema = z.object({
  boardId: z.uuid(),
  listId: z.uuid(),
});

export const updateBoardListSchema = z.object({
  title: z.string().min(MIN_BOARD_TITLE_LENGTH).max(MAX_BOARD_TITLE_LENGTH),
});
