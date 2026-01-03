import { and, eq } from 'drizzle-orm';
import type { Db } from '../db/client';
import { type SessionCreateInput, sessions } from '../db/schema';

export class SessionRepo {
  constructor(private readonly db: Db) {}

  async create(values: SessionCreateInput) {
    await this.db.insert(sessions).values(values);
  }

  async findById(sessionId: string) {
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId));

    return session ?? null;
  }

  async updateExpiresAt(sessionId: string, expiresAt: string) {
    await this.db
      .update(sessions)
      .set({ expiresAt })
      .where(eq(sessions.id, sessionId));
  }

  async delete(sessionId: string) {
    await this.db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async deleteByIdAndUserId(sessionId: string, userId: string) {
    await this.db
      .delete(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
  }
}
