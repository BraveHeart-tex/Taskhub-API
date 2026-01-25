import { and, count, eq } from 'drizzle-orm';
import { useDb } from '@/db/context';
import { users, workspaceMembers } from '@/db/schema';

export class WorkspaceMemberReadRepository {
  async isMember(workspaceId: string, userId: string) {
    const db = useDb();

    const [row] = await db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      )
      .limit(1);

    return Boolean(row);
  }
  async countMembers(workspaceId: string) {
    const db = useDb();

    const [result] = await db
      .select({ value: count() })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    return Number(result?.value ?? 0);
  }
  async getMembersPreview(workspaceId: string, limit: number) {
    const db = useDb();

    return await db
      .select({
        id: users.id,
        name: users.fullName,
        avatarUrl: users.avatarUrl,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(users.id, workspaceMembers.userId))
      .where(eq(workspaceMembers.workspaceId, workspaceId))
      .orderBy(workspaceMembers.createdAt)
      .limit(limit);
  }
}
