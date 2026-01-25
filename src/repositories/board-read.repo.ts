import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { useDb } from '@/db/context';
import { boardMembers, boards, cards, lists, users } from '@/db/schema';
import { BoardMemberNotFoundError } from '@/domain/board/board-member/board-member.errors';

export class BoardReadRepository {
  async getBoard(boardId: string, currentUserId: string) {
    const db = useDb();

    const boardRows = await db
      .select({
        id: boards.id,
        title: boards.title,
        workspaceId: boards.workspaceId,
        createdAt: boards.createdAt,
        updatedAt: boards.updatedAt,
        myRole: boardMembers.role,
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

    if (boardRows.length === 0) {
      throw new BoardMemberNotFoundError();
    }

    const board = boardRows[0];

    const members = await db
      .select({
        userId: users.id,
        fullName: users.fullName,
        role: boardMembers.role,
      })
      .from(boardMembers)
      .innerJoin(users, eq(users.id, boardMembers.userId))
      .where(eq(boardMembers.boardId, boardId))
      .execute();

    const listRows = await db
      .select({
        id: lists.id,
        title: lists.title,
        position: lists.position,
      })
      .from(lists)
      .where(eq(lists.boardId, boardId))
      .orderBy(asc(lists.position))
      .execute();

    const listIds = listRows.map((l) => l.id);

    const cardRows =
      listIds.length === 0
        ? []
        : await db
            .select({
              id: cards.id,
              listId: cards.listId,
              title: cards.title,
              description: cards.description,
              position: cards.position,
              createdAt: cards.createdAt,
              updatedAt: cards.updatedAt,
              createdBy: cards.createdBy,
            })
            .from(cards)
            .where(inArray(cards.listId, listIds))
            .orderBy(asc(cards.position))
            .execute();

    const cardsByList = new Map<string, typeof cardRows>();

    for (const card of cardRows) {
      const existing = cardsByList.get(card.listId);
      if (existing) {
        existing.push(card);
      } else {
        cardsByList.set(card.listId, [card]);
      }
    }

    return {
      board: {
        id: board.id,
        title: board.title,
        workspaceId: board.workspaceId,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        myRole: board.myRole,
      },
      members: members.map((m) => ({
        userId: m.userId,
        fullName: m.fullName,
        role: m.role,
      })),
      lists: listRows.map((list) => ({
        id: list.id,
        title: list.title,
        position: list.position,
        cards:
          cardsByList.get(list.id)?.map((card) => ({
            id: card.id,
            title: card.title,
            description: card.description,
            position: card.position,
            listId: card.listId,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
            createdBy: card.createdBy,
          })) ?? [],
      })),
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
}
