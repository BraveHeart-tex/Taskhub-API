import { BoardMemberNotFoundError } from '../../domain/board/board-member/board-member.errors';
import type { DomainError } from '../../domain/shared/domain-error';

export const boardMemberErrorMap = new Map<
  new () => DomainError,
  { status: number; message: string }
>([
  [
    BoardMemberNotFoundError,
    { status: 404, message: 'Board member not found' },
  ],
]);
