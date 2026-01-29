import type { BoardInsert, BoardRow } from '@/db/schema';
import { withTransaction } from '@/db/transaction';
import { UnauthorizedError } from '@/domain/auth/auth.errors';
import {
  BoardNotFoundError,
  BoardTitleAlreadyExistsError,
  InvalidBoardTitleError,
} from '@/domain/board/board.errors';
import type {
  BoardContentDto,
  GetBoardContextResponse,
  WorkspaceBoardPreviewDto,
} from '@/domain/board/board.types';
import { WorkspaceNotFoundError } from '@/domain/workspace/workspace.errors';
import type { BoardRepository } from '@/repositories/board.repo';
import type { BoardMemberRepository } from '@/repositories/board-member.repo';
import type { BoardReadRepository } from '@/repositories/board-read.repo';
import type { WorkspaceRepository } from '@/repositories/workspace.repo';
import type { WorkspaceMemberRepository } from '@/repositories/workspace-member.repo';

export class BoardService {
  constructor(
    private readonly boardRepo: BoardRepository,
    private readonly boardMemberRepo: BoardMemberRepository,
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly boardReadRepo: BoardReadRepository,
    private readonly workspaceMemberRepo: WorkspaceMemberRepository
  ) {}
  async createBoard(values: BoardInsert): Promise<BoardRow> {
    return withTransaction(async () => {
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

      const board = await this.boardRepo.create(values);

      await this.boardMemberRepo.create({
        boardId: board.id,
        userId: values.createdBy,
        role: 'owner',
      });

      return board;
    });
  }
  async deleteBoard(boardId: string, currentUserId: string): Promise<void> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) {
      throw new BoardNotFoundError();
    }

    if (board.createdBy !== currentUserId) {
      throw new UnauthorizedError();
    }

    await this.boardRepo.delete(boardId);
  }
  async updateBoard(
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
  async listBoardsForWorkspace(
    currentUserId: string,
    workspaceId: string
  ): Promise<WorkspaceBoardPreviewDto[]> {
    const workspace = await this.workspaceRepo.findById(workspaceId);
    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }

    const isMember = await this.workspaceMemberRepo.isMember(
      workspaceId,
      currentUserId
    );
    if (!isMember) {
      throw new UnauthorizedError();
    }

    const rows = await this.boardReadRepo.listBoardsForWorkspace(workspaceId);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      workspaceId: row.workspaceId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      memberCount: row.memberCount,
      isCurrentUserOwner: row.ownerId === currentUserId,
    }));
  }
  async getBoardDetails(
    boardId: string,
    userId: string
  ): Promise<GetBoardContextResponse> {
    return this.boardReadRepo.getBoardContext(boardId, userId);
  }
  async getBoardContent(
    boardId: string,
    userId: string
  ): Promise<BoardContentDto> {
    return this.boardReadRepo.getBoardContent(boardId, userId);
  }
}
