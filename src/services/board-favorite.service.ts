import { BoardAccessDeniedError } from '@/domain/board/board.errors';
import type { BoardFavoriteRepository } from '@/repositories/board-favorite.repo';
import type { BoardMemberRepository } from '@/repositories/board-member.repo';

export class BoardFavoriteService {
  constructor(
    private readonly boardMemberRepo: BoardMemberRepository,
    private readonly boardFavoriteRepo: BoardFavoriteRepository
  ) {}

  async listFavorites(userId: string): Promise<string[]> {
    return this.boardFavoriteRepo.findByUserId(userId);
  }
  async addFavorite({ userId, boardId }: { userId: string; boardId: string }) {
    const isMember = await this.boardMemberRepo.isMember({ boardId, userId });
    if (!isMember) {
      throw new BoardAccessDeniedError();
    }

    await this.boardFavoriteRepo.create({ userId, boardId });
  }
  async removeFavorite({
    userId,
    boardId,
  }: {
    userId: string;
    boardId: string;
  }) {
    const isMember = await this.boardMemberRepo.isMember({ boardId, userId });
    if (!isMember) {
      throw new BoardAccessDeniedError();
    }

    await this.boardFavoriteRepo.delete({ userId, boardId });
  }
}
