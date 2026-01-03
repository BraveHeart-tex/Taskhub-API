import { eq } from 'drizzle-orm';
import type { Db } from '../db/client';
import { type UserCreateInput, users } from '../db/schema';

export class UserRepo {
  constructor(private readonly db: Db) {}

  async create(input: UserCreateInput) {
    const [result] = await this.db.insert(users).values(input).returning();
    return result;
  }

  async findById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));

    return user ?? null;
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user ?? null;
  }
}
