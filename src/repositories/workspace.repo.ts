import { and, eq } from 'drizzle-orm';
import { useDb } from '../db/context';
import {
  type Workspace,
  type WorkspaceCreateInput,
  type WorkspaceUpdateInput,
  workspaces,
} from '../db/schema';

export class WorkspaceRepository {
  async create(values: WorkspaceCreateInput) {
    const db = useDb();
    const [result] = await db.insert(workspaces).values(values).returning();
    return result;
  }

  async update(id: Workspace['id'], changes: WorkspaceUpdateInput) {
    const db = useDb();
    const [result] = await db
      .update(workspaces)
      .set(changes)
      .where(eq(workspaces.id, id))
      .returning();

    return result;
  }

  async delete(id: Workspace['id']) {
    const db = useDb();
    await db.delete(workspaces).where(eq(workspaces.id, id)).returning();
  }

  async findById(id: Workspace['id']) {
    const db = useDb();
    const [result] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));
    return result;
  }

  async findByOwnerAndName(ownerId: Workspace['ownerId'], name: string) {
    const db = useDb();
    const [result] = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.ownerId, ownerId), eq(workspaces.name, name)));
    return result;
  }
}
