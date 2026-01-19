import { withTransaction } from '@/db/transaction';
import { UnauthorizedError } from '@/domain/auth/auth.errors';
import { UserNotFoundError } from '@/domain/user/user.errors';
import { WorkspaceNotFoundError } from '@/domain/workspace/workspace.errors';
import {
  WorkspaceMemberAlreadyExistsError,
  WorkspaceMemberNotFoundError,
} from '@/domain/workspace/workspace-member/workspace-member.errors';
import type { UserRepository } from '@/repositories/user.repo';
import type { WorkspaceRepository } from '@/repositories/workspace.repo';
import type { WorkspaceMemberRepository } from '@/repositories/workspace-member.repo';
import type { WorkspaceMemberListDTO } from '@/routes/workspaces/:workspaceId/members/schema';

export class WorkspaceMemberService {
  constructor(
    private readonly workspaceMemberRepo: WorkspaceMemberRepository,
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly userRepo: UserRepository
  ) {}

  async getWorkspaceMembers(
    workspaceId: string,
    currentUserId: string
  ): Promise<WorkspaceMemberListDTO> {
    const workspace = await this.workspaceRepo.findById(workspaceId);
    if (!workspace) {
      throw new WorkspaceNotFoundError();
    }

    const isMember = await this.workspaceMemberRepo.isMember(
      workspaceId,
      currentUserId
    );
    // Allow workspace owner to see members even if not explicitly added as member
    if (!isMember && workspace.ownerId !== currentUserId) {
      throw new UnauthorizedError();
    }

    return this.workspaceMemberRepo.list(workspaceId);
  }

  async addMember(
    currentUserId: string,
    values: { workspaceId: string; userId: string; role?: 'admin' | 'member' }
  ) {
    return withTransaction(async () => {
      const targetUserExists = await this.userRepo.exists(values.userId);
      if (!targetUserExists) {
        throw new UserNotFoundError();
      }

      const workspace = await this.workspaceRepo.findById(values.workspaceId);
      if (!workspace) {
        throw new WorkspaceNotFoundError();
      }

      const currentUserMemberInfo =
        await this.workspaceMemberRepo.findByIdAndUserId(
          values.workspaceId,
          currentUserId
        );

      const isOwner = workspace.ownerId === currentUserId;
      const isAdmin =
        currentUserMemberInfo?.role === 'admin' ||
        currentUserMemberInfo?.role === 'owner';

      if (!isOwner && !isAdmin) {
        throw new UnauthorizedError();
      }

      const targetUserMemberInfo =
        await this.workspaceMemberRepo.findByIdAndUserId(
          values.workspaceId,
          values.userId
        );

      if (targetUserMemberInfo) {
        throw new WorkspaceMemberAlreadyExistsError();
      }

      if (values.userId === workspace.ownerId) {
        throw new WorkspaceMemberAlreadyExistsError();
      }

      await this.workspaceMemberRepo.create({
        workspaceId: values.workspaceId,
        userId: values.userId,
        role: values.role || 'member',
      });
    });
  }

  async updateWorkspaceMemberRole(
    currentUserId: string,
    values: {
      workspaceId: string;
      userId: string;
      role: 'admin' | 'member';
    }
  ) {
    return withTransaction(async () => {
      const workspace = await this.workspaceRepo.findById(values.workspaceId);
      if (!workspace) {
        throw new WorkspaceNotFoundError();
      }

      if (workspace.ownerId !== currentUserId) {
        throw new UnauthorizedError();
      }

      const targetUserMemberInfo =
        await this.workspaceMemberRepo.findByIdAndUserId(
          values.workspaceId,
          values.userId
        );

      if (!targetUserMemberInfo) {
        throw new WorkspaceMemberNotFoundError();
      }

      if (values.userId === workspace.ownerId) {
        throw new UnauthorizedError();
      }

      await this.workspaceMemberRepo.update(targetUserMemberInfo.memberId, {
        role: values.role,
      });
    });
  }

  async deleteWorkspaceMember(
    currentUserId: string,
    values: { workspaceId: string; userId: string }
  ) {
    return withTransaction(async () => {
      const workspace = await this.workspaceRepo.findById(values.workspaceId);
      if (!workspace) {
        throw new WorkspaceNotFoundError();
      }

      const currentUserMemberInfo =
        await this.workspaceMemberRepo.findByIdAndUserId(
          values.workspaceId,
          currentUserId
        );

      const isOwner = workspace.ownerId === currentUserId;
      const isAdmin =
        currentUserMemberInfo?.role === 'admin' ||
        currentUserMemberInfo?.role === 'owner';

      if (!isOwner && !isAdmin) {
        throw new UnauthorizedError();
      }

      const targetUserMemberInfo =
        await this.workspaceMemberRepo.findByIdAndUserId(
          values.workspaceId,
          values.userId
        );

      if (!targetUserMemberInfo) {
        throw new WorkspaceMemberNotFoundError();
      }

      if (values.userId === workspace.ownerId) {
        throw new UnauthorizedError();
      }

      await this.workspaceMemberRepo.delete(targetUserMemberInfo.memberId);
    });
  }
}
