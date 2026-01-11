import { z } from 'zod';
import {
  MAX_BOARD_TITLE_LENGTH,
  MIN_BOARD_TITLE_LENGTH,
} from '@/domain/board/board.consants';

export const createBoardBodySchema = z.object({
  workspaceId: z.uuid(),
  title: z.string().min(MIN_BOARD_TITLE_LENGTH).max(MAX_BOARD_TITLE_LENGTH),
});

export const boardSchema = z.object({
  id: z.uuid(),
  workspaceId: z.uuid(),
  title: z.string().min(MIN_BOARD_TITLE_LENGTH).max(MAX_BOARD_TITLE_LENGTH),
  createdBy: z.uuid().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const updateBoardBodySchema = z.object({
  title: z.string().min(MIN_BOARD_TITLE_LENGTH).max(MAX_BOARD_TITLE_LENGTH),
});
