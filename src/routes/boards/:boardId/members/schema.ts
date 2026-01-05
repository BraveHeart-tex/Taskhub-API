import { z } from 'zod';

export const boardMemberDtoSchema = z.object({
  boardId: z.uuid(),
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    fullName: z.string().min(2).max(100),
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
