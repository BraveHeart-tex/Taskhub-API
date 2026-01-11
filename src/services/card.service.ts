import { withTransaction } from '@/db/transaction';
import { BoardMemberNotFoundError } from '@/domain/board/board-member/board-member.errors';
import { ListNotFoundError } from '@/domain/board/list/list.errors';
import { CardNotFoundError } from '@/domain/card/card.errors';
import type {
  CreateCardParams,
  DeleteCardParams,
} from '@/domain/card/card.types';
import { computeInsertAtTopPosition } from '@/domain/card/positioning';
import type { BoardMemberRepository } from '@/repositories/board-member.repo';
import type { CardRepository } from '@/repositories/card.repo';
import type { ListRepository } from '@/repositories/list.repo';

export class CardService {
  constructor(
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
      const list = await this.listRepository.findById(listId);
      if (!list || list.boardId !== boardId) {
        throw new ListNotFoundError();
      }

      await this.listRepository.lockById(listId);

      const isMember = await this.boardMemberRepository.isMember(
        boardId,
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
  async deleteCard({
    currentUserId,
    cardId,
    listId,
    boardId,
  }: DeleteCardParams) {
    return withTransaction(async () => {
      const card = await this.cardRepository.findById(cardId);
      if (!card || card.listId !== listId) {
        throw new CardNotFoundError();
      }

      const list = await this.listRepository.findById(listId);
      if (!list || list.boardId !== boardId) {
        throw new ListNotFoundError();
      }

      const isMember = await this.boardMemberRepository.isMember(
        boardId,
        currentUserId
      );
      if (!isMember) {
        throw new BoardMemberNotFoundError();
      }

      await this.cardRepository.delete(cardId);
    });
  }
  async updateCard() {}
}
