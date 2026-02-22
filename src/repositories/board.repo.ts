import { and, eq, getTableColumns } from 'drizzle-orm';
import { useDb } from '@/db/context';
import {
  type BoardInsert,
  type BoardUpdate,
  boardMembers,
  boards,
} from '@/db/schema';

export class BoardRepository {
  async findById(boardId: string) {
    const db = useDb();
    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));

    return board;
  }
  async findByWorkspaceAndTitle({
    title,
    workspaceId,
  }: {
    workspaceId: string;
    title: string;
  }) {
    const db = useDb();
    const [board] = await db
      .select()
      .from(boards)
      .where(and(eq(boards.workspaceId, workspaceId), eq(boards.title, title)));

    return board;
  }
  async create(values: BoardInsert) {
    const db = useDb();
    const [board] = await db.insert(boards).values(values).returning();

    return board;
  }
  async delete(boardId: string) {
    const db = useDb();
    await db.delete(boards).where(eq(boards.id, boardId));
  }
  async update(boardId: string, changes: BoardUpdate) {
    const db = useDb();
    const [updatedBoard] = await db
      .update(boards)
      .set(changes)
      .where(eq(boards.id, boardId))
      .returning();

    return updatedBoard;
  }
  async findByUserId(userId: string) {
    const db = useDb();
    return db
      .select(getTableColumns(boards))
      .from(boards)
      .innerJoin(
        boardMembers,
        and(
          eq(boardMembers.boardId, boards.id),
          eq(boardMembers.userId, userId)
        )
      );
  }
  async findByUserIdAndWorkspaceId({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }) {
    const db = useDb();
    return db
      .select(getTableColumns(boards))
      .from(boards)
      .innerJoin(
        boardMembers,
        and(
          eq(boardMembers.boardId, boards.id),
          eq(boardMembers.userId, userId)
        )
      )
      .where(eq(boards.workspaceId, workspaceId));
  }
}
