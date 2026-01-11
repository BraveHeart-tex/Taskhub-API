import { withTransaction } from '@/db/transaction';
import { BoardNotFoundError } from '@/domain/board/board.errors';
import { BoardMemberNotFoundError } from '@/domain/board/board-member/board-member.errors';
import { ListNotFoundError } from '@/domain/board/list/list.errors';
import type { CreateCardParams } from '@/domain/card/card.types';
import { computeInsertAtTopPosition } from '@/domain/card/positioning';
import type { BoardRepository } from '@/repositories/board.repo';
import type { BoardMemberRepository } from '@/repositories/board-member.repo';
import type { CardRepository } from '@/repositories/card.repo';
import type { ListRepository } from '@/repositories/list.repo';

export class CardService {
  constructor(
    private boardRepository: BoardRepository,
    private listRepository: ListRepository,
    private boardMemberRepository: BoardMemberRepository,
    private cardRepository: CardRepository
  ) {}

  async createCard({
    currentUserId,
    title,
    description,
    listId,
    boardId,
  }: CreateCardParams) {
    return withTransaction(async () => {
      const board = await this.boardRepository.findById(boardId);
      if (!board) {
        throw new BoardNotFoundError();
      }

      const list = await this.listRepository.findById(listId);
      if (!list || list.boardId !== boardId) {
        throw new ListNotFoundError();
      }

      await this.listRepository.lockById(listId);

      const isMember = await this.boardMemberRepository.isMember(
        board.id,
        currentUserId
      );
      if (!isMember) {
        throw new BoardMemberNotFoundError();
      }

      const minPosition =
        await this.cardRepository.getMinPositionInList(listId);

      let { position, needsRebalance } =
        computeInsertAtTopPosition(minPosition);

      if (needsRebalance) {
        await this.cardRepository.rebalancePositions(listId);

        const newMin = await this.cardRepository.getMinPositionInList(listId);

        ({ position } = computeInsertAtTopPosition(newMin));
      }

      return this.cardRepository.create({
        listId,
        title,
        description,
        position: position.toString(),
        createdBy: currentUserId,
      });
    });
  }
}
