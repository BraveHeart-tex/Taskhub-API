import type {
  Workspace,
  WorkspaceCreateInput,
  WorkspaceUpdateInput,
} from '../db/schema';
import { UnauthorizedError } from '../domain/auth/auth.errors';
import {
  WorkspaceNameAlreadyExistsError,
  WorkspaceNotFoundError,
} from '../domain/workspace/workspace.errors';
import type { WorkspaceRepo } from './workspace.repo';

export class WorkspaceService {
  constructor(private readonly workspaceRepo: WorkspaceRepo) {}

  async create(values: WorkspaceCreateInput) {
    const existing = await this.workspaceRepo.findByOwnerAndName(
      values.ownerId,
      values.name
    );

    if (existing) {
      throw new WorkspaceNameAlreadyExistsError();
    }

    return await this.workspaceRepo.create(values);
  }

  async update({
    workspaceId,
    changes,
    currentUserId,
  }: {
    workspaceId: Workspace['id'];
    changes: WorkspaceUpdateInput;
    currentUserId: Workspace['ownerId'];
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

  async delete(
    currentUserId: Workspace['ownerId'],
    workspaceId: Workspace['id']
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
}
