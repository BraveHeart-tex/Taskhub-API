import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { useDb } from '@/db/context';
import {
  boardFavorites,
  boardMembers,
  boards,
  cards,
  lists,
  users,
} from '@/db/schema';
import { BoardMemberNotFoundError } from '@/domain/board/board-member/board-member.errors';

export class BoardReadRepository {
  async getBoardContext({
    boardId,
    userId,
  }: {
    boardId: string;
    userId: string;
  }) {
    const db = useDb();

    const rows = await db
      .select({
        id: boards.id,
        title: boards.title,
        workspaceId: boards.workspaceId,
        role: boardMembers.role,
        isFavorite: sql<boolean>`count(${boardFavorites.userId}) > 0`.as(
          'is_favorite'
        ),
      })
      .from(boards)
      .innerJoin(
        boardMembers,
        and(
          eq(boardMembers.boardId, boards.id),
          eq(boardMembers.userId, userId)
        )
      )
      .leftJoin(
        boardFavorites,
        and(
          eq(boardFavorites.boardId, boards.id),
          eq(boardFavorites.userId, userId)
        )
      )
      .where(and(eq(boards.id, boardId), isNull(boards.archivedAt)))
      .groupBy(boards.id, boardMembers.role)
      .execute();

    const board = rows[0];
    if (!board) {
      throw new BoardMemberNotFoundError();
    }

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
      isFavorite: board.isFavorite,
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

    return await db
      .select({
        id: boards.id,
        title: boards.title,
        workspaceId: boards.workspaceId,
        ownerId: boards.createdBy,
        createdAt: boards.createdAt,
        updatedAt: boards.updatedAt,
        memberCount: sql<number>`cast(count(${boardMembers.id}) as int)`.as(
          'member_count'
        ),
      })
      .from(boards)
      .leftJoin(boardMembers, eq(boardMembers.boardId, boards.id))
      .where(
        and(eq(boards.workspaceId, workspaceId), isNull(boards.archivedAt))
      )
      .groupBy(boards.id)
      .orderBy(desc(boards.createdAt));
  }
  async getBoardContent({
    boardId,
    userId,
  }: {
    boardId: string;
    userId: string;
  }) {
    const db = useDb();

    const membership = await db
      .select({ id: boardMembers.id })
      .from(boardMembers)
      .where(
        and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, userId))
      )
      .limit(1);

    if (membership.length === 0) throw new BoardMemberNotFoundError();

    const listsRows = await db
      .select()
      .from(lists)
      .where(and(eq(lists.boardId, boardId), isNull(lists.archivedAt)))
      .orderBy(asc(lists.position));

    if (listsRows.length === 0) {
      return { boardId, lists: [], users: {} };
    }

    const listIds = listsRows.map((l) => l.id);

    const cardRows = await db
      .select()
      .from(cards)
      .where(and(inArray(cards.listId, listIds), isNull(cards.archivedAt)))
      .orderBy(desc(cards.position));

    const creatorIds = [
      ...new Set(cardRows.map((c) => c.createdBy).filter(Boolean)),
    ] as string[];

    const userMap: Record<string, any> = {};
    if (creatorIds.length > 0) {
      const userRows = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(inArray(users.id, creatorIds));

      for (const u of userRows) userMap[u.id] = u;
    }

    const cardsByList = cardRows.reduce(
      (acc, card) => {
        if (!acc[card.listId]) acc[card.listId] = [];
        acc[card.listId].push(card);
        return acc;
      },
      {} as Record<string, typeof cardRows>
    );

    return {
      boardId,
      lists: listsRows.map((l) => ({
        ...l,
        cards: cardsByList[l.id] ?? [],
      })),
      users: userMap,
    };
  }
}
