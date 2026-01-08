import { and, eq } from 'drizzle-orm';
import { useDb } from '../db/context';
import { type SessionCreateInput, sessions } from '../db/schema';

export class SessionRepo {
  async create(values: SessionCreateInput) {
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
}
