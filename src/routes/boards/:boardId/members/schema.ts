import { z } from 'zod';
import {
  MAX_FULL_NAME_LENGTH,
  MIN_FULL_NAME_LENGTH,
} from '@/domain/auth/auth.constants';

export const boardMemberDtoSchema = z.object({
  boardId: z.uuid(),
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    fullName: z.string().min(MIN_FULL_NAME_LENGTH).max(MAX_FULL_NAME_LENGTH),
  }),
  role: z.literal('owner').or(z.literal('member')),
  joinedAt: z.iso.datetime(),
});

export const boardMemberListDtoSchema = z.array(boardMemberDtoSchema);

export const boardMemberCreateDtoSchema = z.object({
  userId: z.uuid(),
});

export type BoardMemberDTO = z.infer<typeof boardMemberDtoSchema>;
export type BoardMemberListDTO = BoardMemberDTO[];
