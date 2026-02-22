import { z } from 'zod';
import {
  MAX_BOARD_TITLE_LENGTH,
  MIN_BOARD_TITLE_LENGTH,
} from '@/domain/board/board.consants';

export const createBoardBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(MIN_BOARD_TITLE_LENGTH)
    .max(MAX_BOARD_TITLE_LENGTH),
});

export const boardSchema = z.object({
  id: z.uuid(),
  workspaceId: z.uuid(),
  title: z
    .string()
    .trim()
    .min(MIN_BOARD_TITLE_LENGTH)
    .max(MAX_BOARD_TITLE_LENGTH),
  createdBy: z.uuid().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const updateBoardBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(MIN_BOARD_TITLE_LENGTH)
    .max(MAX_BOARD_TITLE_LENGTH),
});

export const workspaceBoardPreviewSchema = z.object({
  id: z.uuid(),
  title: z.string().min(MIN_BOARD_TITLE_LENGTH).max(MAX_BOARD_TITLE_LENGTH),
  workspaceId: z.uuid(),
  isCurrentUserOwner: z.boolean(),
  memberCount: z.number().min(0),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const workspaceBoardPreviewResponseSchema = z.array(
  workspaceBoardPreviewSchema
);
