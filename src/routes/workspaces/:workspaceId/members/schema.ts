import { z } from 'zod';
import {
  MAX_FULL_NAME_LENGTH,
  MIN_FULL_NAME_LENGTH,
} from '@/domain/auth/auth.constants';

export const workspaceMemberDtoSchema = z.object({
  workspaceId: z.uuid(),
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    fullName: z
      .string()
      .trim()
      .min(MIN_FULL_NAME_LENGTH)
      .max(MAX_FULL_NAME_LENGTH),
  }),
  role: z.literal('owner').or(z.literal('admin')).or(z.literal('member')),
  joinedAt: z.iso.datetime(),
});

export const workspaceMemberListDtoSchema = z.array(workspaceMemberDtoSchema);

export const workspaceMemberCreateDtoSchema = z.object({
  userId: z.uuid(),
  role: z.literal('admin').or(z.literal('member')).optional(),
});

export const workspaceMemberUpdateRoleDtoSchema = z.object({
  role: z.literal('admin').or(z.literal('member')),
});

export type WorkspaceMemberDTO = z.infer<typeof workspaceMemberDtoSchema>;
export type WorkspaceMemberListDTO = WorkspaceMemberDTO[];

