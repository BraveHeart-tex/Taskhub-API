import { and, eq, lt } from 'drizzle-orm';
import { useDb } from '@/db/context';
import { type SessionInsert, sessions } from '@/db/schema';

export class SessionRepository {
  async create(values: SessionInsert) {
    const db = useDb();
    await db.insert(sessions).values(values);
  }

  async findById(sessionId: string) {
    const db = useDb();
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId));

    return session ?? null;
  }

  async updateExpiresAt(sessionId: string, expiresAt: string) {
    const db = useDb();
    await db
      .update(sessions)
      .set({ expiresAt })
      .where(eq(sessions.id, sessionId));
  }

  async delete(sessionId: string) {
    const db = useDb();
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async deleteByIdAndUserId(sessionId: string, userId: string) {
    const db = useDb();
    await db
      .delete(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
  }
  async extendIfLater(sessionId: string, newExpiresAt: string) {
    const db = useDb();
    await db
      .update(sessions)
      .set({ expiresAt: newExpiresAt })
      .where(
        and(eq(sessions.id, sessionId), lt(sessions.expiresAt, newExpiresAt))
      );
  }
}
