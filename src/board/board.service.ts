import type { Board, BoardCreateInput, BoardUpdateInput } from '../db/schema';
import { UnauthorizedError } from '../domain/auth/auth.errors';
import {
  BoardNotFoundError,
  BoardTitleAlreadyExistsError,
  InvalidBoardTitleError,
} from '../domain/board/board.errors';
import { WorkspaceNotFoundError } from '../domain/workspace/workspace.errors';
import type { WorkspaceRepository } from '../workspace/workspace.repo';
import type { BoardRepository } from './board.repo';

export class BoardService {
  constructor(
    private readonly boardRepo: BoardRepository,
    private readonly workspaceRepo: WorkspaceRepository
  ) {}
  async createBoard(values: BoardCreateInput): Promise<Board> {
    const workspace = await this.workspaceRepo.findById(values.workspaceId);
    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }

    if (workspace.ownerId !== values.createdBy) {
      throw new UnauthorizedError();
    }

    const title = values.title.trim();
    if (!title) throw new InvalidBoardTitleError();

    const existing = await this.boardRepo.findByWorkspaceAndTitle(
      values.workspaceId,
      title
    );

    if (existing) {
      throw new BoardTitleAlreadyExistsError();
    }

    return this.boardRepo.create(values);
  }
  async delete(boardId: string, currentUserId: string): Promise<void> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) {
      throw new BoardNotFoundError();
    }

    if (board.createdBy !== currentUserId) {
      throw new UnauthorizedError();
    }

    await this.boardRepo.delete(boardId);
  }
  async update(
    currentUserId: string,
    boardId: string,
    changes: { title: string }
  ) {
    const board = await this.boardRepo.findById(boardId);
    if (!board) {
      throw new BoardNotFoundError();
    }

    if (board.createdBy !== currentUserId) {
      throw new UnauthorizedError();
    }

    const title = changes.title.trim();
    if (!title) throw new InvalidBoardTitleError();

    const existing = await this.boardRepo.findByWorkspaceAndTitle(
      board.workspaceId,
      title
    );

    if (existing && existing.id !== boardId) {
      throw new BoardTitleAlreadyExistsError();
    }

    return this.boardRepo.update(boardId, { title });
  }
}
