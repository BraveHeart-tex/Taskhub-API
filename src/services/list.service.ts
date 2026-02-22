import { withTransaction } from '@/db/transaction';
import { UnauthorizedError } from '@/domain/auth/auth.errors';
import { BoardNotFoundError } from '@/domain/board/board.errors';
import {
  InvalidListTitleError,
  ListNotFoundError,
} from '@/domain/board/list/list.errors';
import type { MoveListParams } from '@/domain/board/list/list.types';
import {
  computeInsertAtBottomPosition,
  computeNewPosition,
} from '@/domain/positioning/ordering';
import { generateShortId } from '@/lib/nanoid';
import type { BoardRepository } from '@/repositories/board.repo';
import type { BoardMemberRepository } from '@/repositories/board-member.repo';
import type { ListRepository } from '@/repositories/list.repo';

export class ListService {
  constructor(
    private readonly listRepository: ListRepository,
    private readonly boardRepository: BoardRepository,
    private readonly boardMemberRepository: BoardMemberRepository
  ) {}
  async createList({
    currentUserId,
    boardId,
    title,
  }: {
    currentUserId: string;
    boardId: string;
    title: string;
  }) {
    return withTransaction(async () => {
      const board = await this.boardRepository.findById(boardId);
      if (!board) {
        throw new BoardNotFoundError();
      }

      const isCurrentUserBoardMember =
        await this.boardMemberRepository.isMember({
          boardId,
          userId: currentUserId,
        });
      if (!isCurrentUserBoardMember) {
        throw new UnauthorizedError();
      }

      const max = await this.listRepository.getMaxPosition(boardId);
      const { position } = computeInsertAtBottomPosition(max);

      return this.listRepository.create({
        boardId,
        title,
        position: position.toString(),
        shortId: await generateShortId(),
      });
    });
  }
  async updateList({
    currentUserId,
    listId,
    title,
  }: {
    currentUserId: string;
    listId: string;
    title: string;
  }) {
    return withTransaction(async () => {
      const list = await this.listRepository.findById(listId);
      if (!list) {
        throw new ListNotFoundError();
      }

      const isMember = await this.boardMemberRepository.isMember({
        boardId: list.boardId,
        userId: currentUserId,
      });
      if (!isMember) {
        throw new UnauthorizedError();
      }

      const nextTitle = title.trim();
      if (!nextTitle) {
        throw new InvalidListTitleError();
      }

      return this.listRepository.update(listId, { title: nextTitle });
    });
  }
  async moveList({
    currentUserId,
    listId,
    beforeListId,
    afterListId,
  }: MoveListParams) {
    return withTransaction(async () => {
      const list = await this.listRepository.findById(listId);
      if (!list) {
        throw new ListNotFoundError();
      }

      const isMember = await this.boardMemberRepository.isMember({
        boardId: list.boardId,
        userId: currentUserId,
      });
      if (!isMember) throw new UnauthorizedError();

      await this.listRepository.lockById(listId);

      const before = beforeListId
        ? await this.listRepository.findById(beforeListId)
        : null;

      const after = afterListId
        ? await this.listRepository.findById(afterListId)
        : null;

      if (
        (before && before.boardId !== list.boardId) ||
        (after && after.boardId !== list.boardId)
      ) {
        throw new ListNotFoundError();
      }

      let { position, needsRebalance } = computeNewPosition({
        before: before?.position,
        after: after?.position,
      });

      if (needsRebalance) {
        await this.listRepository.rebalancePositions(list.boardId);

        const refreshedBefore = beforeListId
          ? await this.listRepository.findById(beforeListId)
          : null;

        const refreshedAfter = afterListId
          ? await this.listRepository.findById(afterListId)
          : null;

        ({ position } = computeNewPosition({
          before: refreshedBefore?.position,
          after: refreshedAfter?.position,
        }));
      }

      await this.listRepository.update(listId, {
        position: position.toString(),
      });
    });
  }
  async deleteList({
    currentUserId,
    listId,
  }: {
    currentUserId: string;
    listId: string;
  }) {
    return withTransaction(async () => {
      const list = await this.listRepository.findById(listId);
      if (!list) {
        throw new ListNotFoundError();
      }

      const isCurrentUserBoardMember =
        await this.boardMemberRepository.isMember({
          boardId: list.boardId,
          userId: currentUserId,
        });
      if (!isCurrentUserBoardMember) {
        throw new UnauthorizedError();
      }

      await this.listRepository.delete(listId);
    });
  }
}
