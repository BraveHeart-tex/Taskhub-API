import { asc, eq, sql } from 'drizzle-orm';
import { useDb } from '@/db/context';
import { type CardCreate, cards } from '@/db/schema';
import { CARD_POSITION_GAP } from '@/domain/card/card.constants';

export class CardRepository {
  async create(input: CardCreate) {
    const db = useDb();
    const [card] = await db.insert(cards).values(input).returning();
    return card;
  }
  async findById(cardId: string) {
    const db = useDb();
    const [card] = await db.select().from(cards).where(eq(cards.id, cardId));
    return card;
  }
  async getMinPositionInList(listId: string): Promise<string | null> {
    const db = useDb();

    const [row] = await db
      .select({ position: cards.position })
      .from(cards)
      .where(eq(cards.listId, listId))
      .orderBy(asc(cards.position))
      .limit(1);

    return row?.position ?? null;
  }
  async rebalancePositions(listId: string) {
    const db = useDb();
    const rows = await db
      .select({ id: cards.id })
      .from(cards)
      .where(eq(cards.listId, listId))
      .orderBy(asc(cards.position), asc(cards.id));

    if (rows.length === 0) return;

    const caseSql = sql.join(
      rows.map(
        (row, index) =>
          sql`WHEN ${cards.id} = ${row.id} THEN ${sql.raw(
            `${index + 1} * ${CARD_POSITION_GAP}`
          )}::numeric`
      ),
      sql.raw(' ')
    );

    await db.execute(sql`
      UPDATE ${cards}
      SET position = CASE ${caseSql} END
      WHERE ${cards.listId} = ${listId}
    `);
  }
  async delete(cardId: string) {
    const db = useDb();
    await db.delete(cards).where(eq(cards.id, cardId));
  }
}
