import { and, eq, sql } from 'drizzle-orm';
import { useDb } from '../db/context';
import { type BoardMemberCreateInput, boardMembers, users } from '../db/schema';

export class BoardMemberRepository {
  async create(values: BoardMemberCreateInput) {
    const db = useDb();
    const [boardMember] = await db
      .insert(boardMembers)
      .values(values)
      .returning();
    return boardMember;
  }
  async list(boardId: string) {
    const db = useDb();
    return await db
      .select({
        boardId: boardMembers.boardId,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
        },
        role: boardMembers.role,
        joinedAt: boardMembers.createdAt,
      })
      .from(boardMembers)
      .innerJoin(users, eq(boardMembers.userId, users.id))
      .where(eq(boardMembers.boardId, boardId));
  }
  async isMember(boardId: string, userId: string) {
    const db = useDb();
    const result = await db.execute<{ exists: boolean }>(
      sql<{
        exists: boolean;
      }>`SELECT EXISTS(SELECT 1 FROM ${boardMembers} WHERE ${boardMembers.boardId} = ${boardId} AND ${boardMembers.userId} = ${userId})`
    );
    return result.rows[0]?.exists;
  }
  async findByIdAndUserId(boardId: string, userId: string) {
    const db = useDb();
    const [boardMember] = await db
      .select({
        boardId: boardMembers.boardId,
        memberId: boardMembers.id,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
        },
        role: boardMembers.role,
        joinedAt: boardMembers.createdAt,
      })
      .from(boardMembers)
      .innerJoin(users, eq(boardMembers.userId, users.id))
      .where(
        and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, userId))
      );
    return boardMember;
  }
  async delete(id: string) {
    const db = useDb();
    await db.delete(boardMembers).where(eq(boardMembers.id, id));
  }
}
