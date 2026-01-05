import type { UserRepository } from '../auth/user.repo';
import type { BoardRepository } from '../board/board.repo';
import { withTransaction } from '../db/transaction';
import { UnauthorizedError } from '../domain/auth/auth.errors';
import { BoardNotFoundError } from '../domain/board/board.errors';
import {
  BoardMemberAlreadyExistsError,
  BoardMemberNotFoundError,
} from '../domain/board/board-member/board-member.errors';
import { UserNotFoundError } from '../domain/user/user.errors';
import type { BoardMemberListDTO } from '../routes/boards/:boardId/members/schema';
import type { BoardMemberRepository } from './board-member.repo';

export class BoardMemberService {
  constructor(
    private readonly boardMemberRepo: BoardMemberRepository,
    private readonly boardRepo: BoardRepository,
    private readonly userRepo: UserRepository
  ) {}

  async getBoardMembers(
    boardId: string,
    currentUserId: string
  ): Promise<BoardMemberListDTO> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) {
      throw new BoardNotFoundError();
    }

    const isMember = await this.boardMemberRepo.isMember(
      boardId,
      currentUserId
    );
    if (!isMember) {
      throw new BoardMemberNotFoundError();
    }

    return this.boardMemberRepo.list(boardId);
  }
  async addMember(
    currentUserId: string,
    values: { boardId: string; userId: string }
  ) {
    return withTransaction(async () => {
      const targetUserExists = await this.userRepo.exists(values.userId);
      if (!targetUserExists) {
        throw new UserNotFoundError();
      }

      const board = await this.boardRepo.findById(values.boardId);
      if (!board) {
        throw new BoardNotFoundError();
      }

      const currentUserBoardMemberInfo =
        await this.boardMemberRepo.findByIdAndUserId(
          values.boardId,
          currentUserId
        );

      if (
        !currentUserBoardMemberInfo ||
        currentUserBoardMemberInfo?.role !== 'owner'
      ) {
        throw new UnauthorizedError();
      }

      const targetUserBoardMemberInfo =
        await this.boardMemberRepo.findByIdAndUserId(
          values.boardId,
          values.userId
        );

      if (targetUserBoardMemberInfo) {
        throw new BoardMemberAlreadyExistsError();
      }

      await this.boardMemberRepo.create({
        boardId: values.boardId,
        userId: values.userId,
        role: 'member',
      });
    });
  }
}
