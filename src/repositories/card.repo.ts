import { asc, desc, eq, sql } from 'drizzle-orm';
import { useDb } from '@/db/context';
import { type CardCreate, type CardUpdate, cards } from '@/db/schema';
import { POSITION_GAP } from '@/domain/positioning/ordering.constants';

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
  async getMaxPositionInList(listId: string): Promise<string | null> {
    const db = useDb();
    const [row] = await db
      .select({ position: cards.position })
      .from(cards)
      .where(eq(cards.listId, listId))
      .orderBy(desc(cards.position))
      .limit(1);
    return row?.position ?? null;
  }
  async getPositionInList({
    cardId,
    listId,
  }: {
    cardId: string;
    listId: string;
  }): Promise<string | null> {
    const db = useDb();
    const [row] = await db
      .select({ position: cards.position })
      .from(cards)
      .where(eq(cards.id, cardId))
      .limit(1);

    if (!row) return null;

    const card = await this.findById(cardId);
    if (!card || card.listId !== listId) return null;

    return row.position;
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
            `${index + 1} * ${POSITION_GAP}`
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
  async move(cardId: string, input: { listId: string; position: string }) {
    const db = useDb();
    const [card] = await db
      .update(cards)
      .set(input)
      .where(eq(cards.id, cardId))
      .returning();
    return card;
  }
  async update(cardId: string, values: CardUpdate) {
    const db = useDb();
    const [result] = await db
      .update(cards)
      .set(values)
      .where(eq(cards.id, cardId))
      .returning();

    return result;
  }
}
