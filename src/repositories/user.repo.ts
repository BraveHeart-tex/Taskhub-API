import { eq, sql } from 'drizzle-orm';
import { useDb } from '../db/context';
import { type UserCreateInput, users } from '../db/schema';

export class UserRepository {
  async create(input: UserCreateInput) {
    const db = useDb();
    const [result] = await db.insert(users).values(input).returning();
    return result;
  }
  async findById(id: string) {
    const db = useDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user ?? null;
  }
  async findByEmail(email: string) {
    const db = useDb();
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user ?? null;
  }
  async exists(id: string): Promise<boolean> {
    const db = useDb();
    const result = await db.execute<{ exists: boolean }>(
      sql<{
        exists: boolean;
      }>`SELECT EXISTS(SELECT 1 FROM ${users} WHERE ${users.id} = ${id})`
    );
    return result.rows[0]?.exists;
  }
}
