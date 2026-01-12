import { asc, sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm/gel-core/expressions';
import { useDb } from '@/db/context';
import { type ListCreate, type ListUpdate, lists } from '@/db/schema';
import { POSITION_GAP } from '@/domain/positioning/ordering';

export class ListRepository {
  async create(values: ListCreate) {
    const db = useDb();
    const [result] = await db.insert(lists).values(values).returning();
    return result;
  }
  async lockById(listId: string): Promise<void> {
    const db = useDb();

    await db.execute(sql`
      SELECT 1
      FROM ${lists}
      WHERE ${lists.id} = ${listId}
      FOR UPDATE
    `);
  }
  async getMaxPosition(boardId: string): Promise<string | null> {
    const db = useDb();
    const [row] = await db
      .select({ max: sql<string>`max(${lists.position})` })
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
  async update(listId: string, values: ListUpdate) {
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
  async rebalancePositions(boardId: string) {
    const db = useDb();
    const rows = await db
      .select({ id: lists.id })
      .from(lists)
      .where(eq(lists.boardId, boardId))
      .orderBy(asc(lists.position), asc(lists.id));

    if (rows.length === 0) return;

    const caseSql = sql.join(
      rows.map(
        (row, index) =>
          sql`WHEN ${lists.id} = ${row.id} THEN ${sql.raw(
            `${index + 1} * ${POSITION_GAP}`
          )}::numeric`
      ),
      sql.raw(' ')
    );

    await db.execute(sql`
      UPDATE ${lists}
      SET position = CASE ${caseSql} END
      WHERE ${lists.boardId} = ${boardId}
    `);
  }
}
