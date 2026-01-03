import {
  BoardNotFoundError,
  BoardTitleAlreadyExistsError,
  InvalidBoardTitleError,
} from '../../domain/board/board.errors';
import type { DomainError } from '../../domain/shared/domain-error';

export const boardErrorMap = new Map<
  new () => DomainError,
  { status: number; message: string }
>([
  [InvalidBoardTitleError, { status: 400, message: 'Invalid board title' }],
  [BoardNotFoundError, { status: 404, message: 'Board not found' }],
  [
    BoardTitleAlreadyExistsError,
    { status: 409, message: 'Board title already exists' },
  ],
]);
