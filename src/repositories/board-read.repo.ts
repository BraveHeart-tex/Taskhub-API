import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { useDb } from '@/db/context';
import { boardMembers, boards, cards, lists, users } from '@/db/schema';
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
  async getBoardContent(boardId: string, userId: string) {
    const db = useDb();

    const isMember = await db
      .select()
      .from(boardMembers)
      .where(
        and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, userId))
      )
      .limit(1);

    if (isMember.length === 0) {
      throw new BoardMemberNotFoundError();
    }

    const listsRows = await db
      .select()
      .from(lists)
      .where(eq(lists.boardId, boardId))
      .orderBy(asc(lists.position));

    const cardRows = listsRows.length
      ? await db
          .select()
          .from(cards)
          .where(
            inArray(
              cards.listId,
              listsRows.map((l) => l.id)
            )
          )
          .orderBy(asc(cards.position))
      : [];

    const cardsByList = new Map<string, typeof cardRows>();

    for (const card of cardRows) {
      const arr = cardsByList.get(card.listId) ?? [];
      arr.push(card);
      cardsByList.set(card.listId, arr);
    }

    const userIds = new Set(cardRows.map((c) => c.createdBy));

    const userRows = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(inArray(users.id, [...userIds]));

    const userMap = Object.fromEntries(userRows.map((u) => [u.id, u]));

    return {
      boardId,
      lists: listsRows.map((l) => ({
        id: l.id,
        title: l.title,
        position: l.position,
        cards: cardsByList.get(l.id) ?? [],
      })),
      users: userMap,
    };
  }
}
