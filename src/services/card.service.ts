import { withTransaction } from '@/db/transaction';
import { BoardMemberNotFoundError } from '@/domain/board/board-member/board-member.errors';
import { ListNotFoundError } from '@/domain/board/list/list.errors';
import { CardNotFoundError } from '@/domain/card/card.errors';
import type {
  CreateCardInput,
  DeleteCardInput,
  MoveCardInput,
  UpdateCardInput,
} from '@/domain/card/card.types';
import {
  computeInsertAtTopPosition,
  computeNewPosition,
} from '@/domain/positioning/ordering';
import { generateShortId } from '@/lib/nanoid';
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
  }: CreateCardInput) {
    return withTransaction(async () => {
      const list = await this.listRepository.findById(listId);
      if (!list) {
        throw new ListNotFoundError();
      }

      await this.listRepository.lockById(listId);

      const isMember = await this.boardMemberRepository.isMember({
        boardId: list.boardId,
        userId: currentUserId,
      });
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
        shortId: await generateShortId(),
      });
    });
  }
  async deleteCard({
    currentUserId,
    cardId,
    listId,
    boardId,
  }: DeleteCardInput) {
    return withTransaction(async () => {
      const card = await this.cardRepository.findById(cardId);
      if (!card || card.listId !== listId) {
        throw new CardNotFoundError();
      }

      const list = await this.listRepository.findById(listId);
      if (!list || list.boardId !== boardId) {
        throw new ListNotFoundError();
      }

      const isMember = await this.boardMemberRepository.isMember({
        boardId: boardId,
        userId: currentUserId,
      });
      if (!isMember) {
        throw new BoardMemberNotFoundError();
      }

      await this.cardRepository.delete(cardId);
    });
  }
  async updateCard({
    currentUserId,
    cardId,
    listId,
    boardId,
    title,
    description,
  }: UpdateCardInput) {
    return withTransaction(async () => {
      const card = await this.cardRepository.findById(cardId);
      if (!card || card.listId !== listId) {
        throw new CardNotFoundError();
      }

      const list = await this.listRepository.findById(listId);
      if (!list || list.boardId !== boardId) {
        throw new ListNotFoundError();
      }

      const isMember = await this.boardMemberRepository.isMember({
        boardId,
        userId: currentUserId,
      });
      if (!isMember) {
        throw new BoardMemberNotFoundError();
      }

      return await this.cardRepository.update(cardId, {
        title: title ?? '',
        description: description ?? null,
      });
    });
  }
  async moveCard({
    currentUserId,
    boardId,
    cardId,
    targetListId,
    beforeCardId,
    afterCardId,
  }: MoveCardInput) {
    return withTransaction(async () => {
      const isMember = await this.boardMemberRepository.isMember({
        boardId,
        userId: currentUserId,
      });
      if (!isMember) {
        throw new BoardMemberNotFoundError();
      }

      const card = await this.cardRepository.findById(cardId);
      if (!card) {
        throw new CardNotFoundError();
      }

      const sourceListId = card.listId;

      const targetList = await this.listRepository.findById(targetListId);
      if (!targetList || targetList.boardId !== boardId) {
        throw new ListNotFoundError();
      }

      await this.listRepository.lockById(sourceListId);
      if (sourceListId !== targetListId) {
        await this.listRepository.lockById(targetListId);
      }

      const beforePosition = beforeCardId
        ? await this.cardRepository.getPositionInList({
            cardId: beforeCardId,
            listId: targetListId,
          })
        : null;

      const afterPosition = afterCardId
        ? await this.cardRepository.getPositionInList({
            cardId: afterCardId,
            listId: targetListId,
          })
        : null;

      if (beforeCardId && beforePosition === null) {
        throw new CardNotFoundError();
      }
      if (afterCardId && afterPosition === null) {
        throw new CardNotFoundError();
      }

      let { position, needsRebalance } = computeNewPosition({
        before: beforePosition,
        after: afterPosition,
      });

      if (needsRebalance) {
        await this.cardRepository.rebalancePositions(targetListId);

        const refreshedBefore = beforeCardId
          ? await this.cardRepository.getPositionInList({
              cardId: beforeCardId,
              listId: targetListId,
            })
          : null;

        const refreshedAfter = afterCardId
          ? await this.cardRepository.getPositionInList({
              cardId: afterCardId,
              listId: targetListId,
            })
          : null;

        ({ position } = computeNewPosition({
          before: refreshedBefore,
          after: refreshedAfter,
        }));
      }

      return this.cardRepository.move(cardId, {
        listId: targetListId,
        position: position.toString(),
      });
    });
  }
}
