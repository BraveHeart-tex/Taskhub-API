import { and, eq } from 'drizzle-orm';
import { useDb } from '@/db/context';
import { boardFavorites } from '@/db/schema';

export class BoardFavoriteRepository {
  async findByUserId(userId: string): Promise<string[]> {
    const db = useDb();
    const rows = await db
      .select()
      .from(boardFavorites)
      .where(eq(boardFavorites.userId, userId));

    return rows.map((row) => row.boardId);
  }
  async create({
    userId,
    boardId,
  }: {
    userId: string;
    boardId: string;
  }): Promise<void> {
    const db = useDb();
    await db.insert(boardFavorites).values({
      userId,
      boardId,
    });
  }
  async delete({
    userId,
    boardId,
  }: {
    userId: string;
    boardId: string;
  }): Promise<void> {
    const db = useDb();
    await db
      .delete(boardFavorites)
      .where(
        and(
          eq(boardFavorites.userId, userId),
          eq(boardFavorites.boardId, boardId)
        )
      );
  }
}
