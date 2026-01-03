import type { Db } from '../db/client';
import { type BoardMemberCreateInput, boardMembers } from '../db/schema';

export class BoardMemberRepository {
  constructor(private readonly db: Db) {}
  async create(values: BoardMemberCreateInput) {
    const [boardMember] = await this.db
      .insert(boardMembers)
      .values(values)
      .returning();
    return boardMember;
  }
}
