import { and, eq } from 'drizzle-orm';
import type { Db } from '../db/client';
import { type BoardCreateInput, boards } from '../db/schema';

export class BoardRepository {
  constructor(private readonly db: Db) {}

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
}
