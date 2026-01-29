import { and, desc, eq, sql } from 'drizzle-orm';
import { useDb } from '@/db/context';
import { boardMembers, boards } from '@/db/schema';
import { BoardMemberNotFoundError } from '@/domain/board/board-member/board-member.errors';

export class BoardReadRepository {
  async getBoardContext(boardId: string, currentUserId: string) {
    const db = useDb();

    const rows = await db
      .select({
        id: boards.id,
        title: boards.title,
        workspaceId: boards.workspaceId,
        role: boardMembers.role,
      })
      .from(boards)
      .innerJoin(
        boardMembers,
        and(
          eq(boardMembers.boardId, boards.id),
          eq(boardMembers.userId, currentUserId)
        )
      )
      .where(eq(boards.id, boardId))
      .execute();

    if (rows.length === 0) {
      throw new BoardMemberNotFoundError();
    }

    const board = rows[0];

    const isOwner = board.role === 'owner';

    return {
      id: board.id,
      title: board.title,
      workspaceId: board.workspaceId,
      myRole: board.role,
      permissions: {
        canEditBoard: true,
        canDeleteBoard: isOwner,
        canManageMembers: isOwner,
      },
    };
  }
  async getRecentBoardsForWorkspace(workspaceId: string, limit: number) {
    const db = useDb();

    return await db
      .select({
        id: boards.id,
        title: boards.title,
        updatedAt: boards.updatedAt,
      })
      .from(boards)
      .where(eq(boards.workspaceId, workspaceId))
      .orderBy(desc(boards.updatedAt))
      .limit(limit);
  }
  async listBoardsForWorkspace(workspaceId: string) {
    const db = useDb();

    const rows = await db
      .select({
        id: boards.id,
        title: boards.title,
        workspaceId: boards.workspaceId,
        ownerId: boards.createdBy,
        createdAt: boards.createdAt,
        updatedAt: boards.updatedAt,
        memberCount: sql`COUNT(${boardMembers.id})`
          .mapWith(Number)
          .as('member_count'),
      })
      .from(boards)
      .leftJoin(boardMembers, eq(boardMembers.boardId, boards.id))
      .where(eq(boards.workspaceId, workspaceId))
      .groupBy(boards.id);

    return rows;
  }
}
