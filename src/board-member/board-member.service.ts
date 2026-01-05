import type { BoardRepository } from '../board/board.repo';
import { BoardNotFoundError } from '../domain/board/board.errors';
import { BoardMemberNotFoundError } from '../domain/board/board-member/board-member.errors';
import type { BoardMemberListDTO } from '../routes/boards/:boardId/members/schema';
import type { BoardMemberRepository } from './board-member.repo';

export class BoardMemberService {
  constructor(
    private readonly boardMemberRepo: BoardMemberRepository,
    private readonly boardRepo: BoardRepository
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
}
