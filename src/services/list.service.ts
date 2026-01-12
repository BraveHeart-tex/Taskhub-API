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
        await this.boardMemberRepository.isMember(boardId, currentUserId);
      if (!isCurrentUserBoardMember) {
        throw new UnauthorizedError();
      }

      const max = await this.listRepository.getMaxPosition(boardId);
      const { position } = computeInsertAtBottomPosition(max);

      return this.listRepository.create({
        boardId,
        title,
        position: position.toString(),
      });
    });
  }
  async updateList({
    currentUserId,
    boardId,
    listId,
    title,
  }: {
    currentUserId: string;
    boardId: string;
    listId: string;
    title: string;
  }) {
    return withTransaction(async () => {
      const board = await this.boardRepository.findById(boardId);
      if (!board) {
        throw new BoardNotFoundError();
      }

      const isMember = await this.boardMemberRepository.isMember(
        boardId,
        currentUserId
      );
      if (!isMember) {
        throw new UnauthorizedError();
      }

      const list = await this.listRepository.findById(listId);
      if (!list || list.boardId !== boardId) {
        throw new ListNotFoundError();
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
    boardId,
    listId,
    beforeListId,
    afterListId,
  }: MoveListParams) {
    return withTransaction(async () => {
      const isMember = await this.boardMemberRepository.isMember(
        boardId,
        currentUserId
      );
      if (!isMember) throw new UnauthorizedError();

      const list = await this.listRepository.findById(listId);
      if (!list || list.boardId !== boardId) {
        throw new ListNotFoundError();
      }

      await this.listRepository.lockById(listId);

      const before = beforeListId
        ? await this.listRepository.findById(beforeListId)
        : null;

      const after = afterListId
        ? await this.listRepository.findById(afterListId)
        : null;

      if (
        (before && before.boardId !== boardId) ||
        (after && after.boardId !== boardId)
      ) {
        throw new ListNotFoundError();
      }

      let { position, needsRebalance } = computeNewPosition(
        before?.position,
        after?.position
      );

      if (needsRebalance) {
        await this.listRepository.rebalancePositions(boardId);

        const refreshedBefore = beforeListId
          ? await this.listRepository.findById(beforeListId)
          : null;

        const refreshedAfter = afterListId
          ? await this.listRepository.findById(afterListId)
          : null;

        ({ position } = computeNewPosition(
          refreshedBefore?.position,
          refreshedAfter?.position
        ));
      }

      await this.listRepository.update(listId, {
        position: position.toString(),
      });
    });
  }
  async deleteList({
    currentUserId,
    listId,
    boardId,
  }: {
    currentUserId: string;
    listId: string;
    boardId: string;
  }) {
    return withTransaction(async () => {
      const board = await this.boardRepository.findById(boardId);
      if (!board) {
        throw new BoardNotFoundError();
      }

      const isCurrentUserBoardMember =
        await this.boardMemberRepository.isMember(boardId, currentUserId);
      if (!isCurrentUserBoardMember) {
        throw new UnauthorizedError();
      }

      const list = await this.listRepository.findById(listId);
      if (!list) {
        throw new ListNotFoundError();
      }

      await this.listRepository.delete(listId);
    });
  }
}
