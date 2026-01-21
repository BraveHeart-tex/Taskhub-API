import type {
  WorkspaceInsert,
  WorkspaceRow,
  WorkspaceUpdate,
} from '@/db/schema';
import { withTransaction } from '@/db/transaction';
import { UnauthorizedError } from '@/domain/auth/auth.errors';
import { WorkspaceNotFoundError } from '@/domain/workspace/workspace.errors';
import type {
  WorkspaceContextDto,
  WorkspacePreviewDto,
} from '@/domain/workspace/workspace.types';
import { WorkspaceMemberNotFoundError } from '@/domain/workspace/workspace-member/workspace-member.errors';
import type { WorkspaceRepository } from '@/repositories/workspace.repo';
import type { WorkspaceMemberRepository } from '@/repositories/workspace-member.repo';

export class WorkspaceService {
  constructor(
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly workspaceMemberRepo: WorkspaceMemberRepository
  ) {}

  async createWorkspace(values: WorkspaceInsert) {
    return withTransaction(async () => {
      const workspace = await this.workspaceRepo.create(values);

      await this.workspaceMemberRepo.create({
        workspaceId: workspace.id,
        userId: values.ownerId,
        role: 'owner',
      });

      return workspace;
    });
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

  async getWorkspacesForUser(
    currentUserId: string
  ): Promise<WorkspacePreviewDto[]> {
    const workspaces = await this.workspaceRepo.findByUserId(currentUserId);
    return workspaces.map((workspace) => ({
      ...workspace,
      isCurrentUserOwner: workspace.ownerId === currentUserId,
    }));
  }

  async getWorkspaceForUser(
    currentUserId: string,
    workspaceId: string
  ): Promise<WorkspaceContextDto> {
    const workspace = await this.workspaceRepo.findById(workspaceId);

    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }

    const isCurrentUserWorkspaceMember =
      await this.workspaceMemberRepo.isMember(workspaceId, currentUserId);

    if (!isCurrentUserWorkspaceMember) {
      throw new WorkspaceMemberNotFoundError();
    }

    return {
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      isCurrentUserOwner: workspace.ownerId === currentUserId,
      role: workspace.ownerId === currentUserId ? 'owner' : 'member',
    };
  }
}
