import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm/gel-core/expressions';
import { useDb } from '@/db/context';
import {
  type ListRowCreateInput,
  type ListRowUpdateInput,
  lists,
} from '@/db/schema';

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
  async delete(listId: string) {
    const db = useDb();
    await db.delete(lists).where(eq(lists.id, listId));
  }
  async findById(listId: string) {
    const db = useDb();
    const [row] = await db.select().from(lists).where(eq(lists.id, listId));
    return row;
  }
  async update(listId: string, values: Partial<ListRowUpdateInput>) {
    const db = useDb();
    await db.update(lists).set(values).where(eq(lists.id, listId));
  }
}
