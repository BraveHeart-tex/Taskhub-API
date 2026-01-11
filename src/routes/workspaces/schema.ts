import { z } from 'zod';

export const workspaceSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100),
  ownerId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
});

export const workspaceRouteParamsSchema = z.object({
  id: z.uuid(),
});
