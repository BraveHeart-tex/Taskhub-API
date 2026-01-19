import { and, eq, sql } from 'drizzle-orm';
import { useDb } from '@/db/context';
import {
  users,
  type WorkspaceMemberInsert,
  workspaceMembers,
} from '@/db/schema';

export class WorkspaceMemberRepository {
  async create(values: WorkspaceMemberInsert) {
    const db = useDb();
    const [workspaceMember] = await db
      .insert(workspaceMembers)
      .values(values)
      .returning();
    return workspaceMember;
  }

  async list(workspaceId: string) {
    const db = useDb();
    return await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
        },
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.createdAt,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));
  }

  async isMember(workspaceId: string, userId: string) {
    const db = useDb();
    const result = await db.execute<{ exists: boolean }>(
      sql<{
        exists: boolean;
      }>`SELECT EXISTS(SELECT 1 FROM ${workspaceMembers} WHERE ${workspaceMembers.workspaceId} = ${workspaceId} AND ${workspaceMembers.userId} = ${userId})`
    );
    return result.rows[0]?.exists;
  }

  async findByIdAndUserId(workspaceId: string, userId: string) {
    const db = useDb();
    const [workspaceMember] = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        memberId: workspaceMembers.id,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
        },
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.createdAt,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      );
    return workspaceMember;
  }

  async update(id: string, changes: { role: 'owner' | 'admin' | 'member' }) {
    const db = useDb();
    const [workspaceMember] = await db
      .update(workspaceMembers)
      .set(changes)
      .where(eq(workspaceMembers.id, id))
      .returning();
    return workspaceMember;
  }

  async delete(id: string) {
    const db = useDb();
    await db.delete(workspaceMembers).where(eq(workspaceMembers.id, id));
  }
}


