import z from 'zod';

export const createBoardBodySchema = z.object({
  workspaceId: z.uuid(),
  title: z.string().min(1).max(100),
});

export const boardSchema = z.object({
  id: z.uuid(),
  workspaceId: z.uuid(),
  title: z.string().min(1).max(100),
  createdBy: z.uuid().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const deleteBoardParamsSchema = z.object({
  id: z.uuid(),
});

export const updateBoardParamsSchema = z.object({
  id: z.uuid(),
});

export const updateBoardBodySchema = z.object({
  title: z.string().min(1).max(100),
});
