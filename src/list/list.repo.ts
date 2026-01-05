import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm/gel-core/expressions';
import { useDb } from '@/db/context';
import { type ListRowCreateInput, lists } from '@/db/schema';

export class ListRepository {
  async create(values: ListRowCreateInput) {
    const db = useDb();
    const [result] = await db.insert(lists).values(values).returning();
    return result;
  }
  async getMaxPosition(boardId: string) {
    const db = useDb();
    const [row] = await db
      .select({ max: sql<number>`max(${lists.position})` })
      .from(lists)
      .where(eq(lists.boardId, boardId));

    return row?.max ?? null;
  }
}
