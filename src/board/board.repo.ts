import { and, eq, getTableColumns } from 'drizzle-orm';
import type { Db } from '../db/client';
import {
  type BoardCreateInput,
  type BoardUpdateInput,
  boardMembers,
  boards,
} from '../db/schema';

export class BoardRepository {
  constructor(private readonly db: Db) {}
  async findById(boardId: string) {
    const [board] = await this.db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));

    return board;
  }
  async findByWorkspaceAndTitle(workspaceId: string, title: string) {
    const [board] = await this.db
      .select()
      .from(boards)
      .where(and(eq(boards.workspaceId, workspaceId), eq(boards.title, title)));

    return board;
  }
  async create(values: BoardCreateInput) {
    const [board] = await this.db.insert(boards).values(values).returning();

    return board;
  }
  async delete(boardId: string) {
    await this.db.delete(boards).where(eq(boards.id, boardId));
  }
  async update(boardId: string, changes: BoardUpdateInput) {
    const [updatedBoard] = await this.db
      .update(boards)
      .set(changes)
      .where(eq(boards.id, boardId))
      .returning();

    return updatedBoard;
  }
  async findByUserId(userId: string) {
    return this.db
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
}
