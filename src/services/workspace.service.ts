import type {
  WorkspaceInsert,
  WorkspaceRow,
  WorkspaceUpdate,
} from '@/db/schema';
import { UnauthorizedError } from '@/domain/auth/auth.errors';
import {
  WorkspaceNameAlreadyExistsError,
  WorkspaceNotFoundError,
} from '@/domain/workspace/workspace.errors';
import type { WorkspaceRepository } from '@/repositories/workspace.repo';

export class WorkspaceService {
  constructor(private readonly workspaceRepo: WorkspaceRepository) {}

  async createWorkspace(values: WorkspaceInsert) {
    const existing = await this.workspaceRepo.findByOwnerAndName(
      values.ownerId,
      values.name
    );

    if (existing) {
      throw new WorkspaceNameAlreadyExistsError();
    }

    return await this.workspaceRepo.create(values);
  }

  async updateWorkspace({
    workspaceId,
    changes,
    currentUserId,
  }: {
    workspaceId: WorkspaceRow['id'];
    changes: WorkspaceUpdate;
    currentUserId: WorkspaceRow['ownerId'];
  }) {
    const workspace = await this.workspaceRepo.findById(workspaceId);

    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }

    if (workspace.ownerId !== currentUserId) {
      throw new UnauthorizedError();
    }

    if (changes.name && changes.name !== workspace.name) {
      const existing = await this.workspaceRepo.findByOwnerAndName(
        workspace.ownerId,
        changes.name
      );

      if (existing) {
        throw new WorkspaceNameAlreadyExistsError();
      }
    }

    return await this.workspaceRepo.update(workspaceId, changes);
  }

  async deleteWorkspace(
    currentUserId: WorkspaceRow['ownerId'],
    workspaceId: WorkspaceRow['id']
  ) {
    const workspace = await this.workspaceRepo.findById(workspaceId);

    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }

    if (workspace.ownerId !== currentUserId) {
      throw new UnauthorizedError();
    }

    await this.workspaceRepo.delete(workspaceId);
  }

  async getWorkspacesForUser(currentUserId: string) {}
}
