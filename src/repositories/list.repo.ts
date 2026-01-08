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
  async bulkUpdatePositions(
    boardId: string,
    updates: {
      listId: string;
      position: number;
    }[]
  ) {
    if (updates.length === 0) return;

    const db = useDb();

    const cases = sql.join(
      updates.map(
        (u) => sql`WHEN ${lists.id} = ${u.listId} THEN ${u.position}`
      ),
      sql` `
    );

    await db.execute(sql`
      UPDATE ${lists}
      SET position = CASE
        ${cases}
        ELSE position
      END
      WHERE
        ${lists.boardId} = ${boardId}
        AND ${lists.id} IN (${sql.join(
          updates.map((u) => u.listId),
          sql`, `
        )})
    `);
  }
  async findByBoardId(boardId: string) {
    const db = useDb();
    const rows = await db
      .select()
      .from(lists)
      .where(eq(lists.boardId, boardId));
    return rows;
  }
}
