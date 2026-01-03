import type { Board, BoardCreateInput } from '../db/schema';
import { UnauthorizedError } from '../domain/auth/auth.errors';
import {
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
  async delete() {}
  async update() {}
}
