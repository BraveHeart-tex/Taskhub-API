import { z } from 'zod';
import {
  WORKSPACE_NAME_MAX_LENGTH,
  WORKSPACE_NAME_MIN_LENGTH,
} from '@/domain/workspace/workspace.constants';

export const workspaceSchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .min(WORKSPACE_NAME_MIN_LENGTH)
    .max(WORKSPACE_NAME_MAX_LENGTH),
  ownerId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(WORKSPACE_NAME_MIN_LENGTH)
    .max(WORKSPACE_NAME_MAX_LENGTH),
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(WORKSPACE_NAME_MIN_LENGTH)
    .max(WORKSPACE_NAME_MAX_LENGTH),
});

export const workspaceRouteParamsSchema = z.object({
  workspaceId: z.uuid(),
});

export const workspacePreviewSchema = workspaceSchema.extend({
  isCurrentUserOwner: z.boolean(),
  memberCount: z.number(),
  membersPreview: z.array(
    z.object({
      id: z.uuid(),
      name: z.string().min(2).max(100),
    })
  ),
});

export const workspacePreviewResponseSchema = workspacePreviewSchema.array();

export const workspaceContextResponseSchema = workspaceSchema.extend({
  role: z.enum(['owner', 'member']),
  isCurrentUserOwner: z.boolean(),
});
