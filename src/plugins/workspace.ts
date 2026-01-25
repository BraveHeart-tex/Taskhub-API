import fp from 'fastify-plugin';
import { BoardReadRepository } from '@/repositories/board-read.repo';
import { WorkspaceRepository } from '@/repositories/workspace.repo';
import { WorkspaceMemberRepository } from '@/repositories/workspace-member.repo';
import { WorkspaceMemberReadRepository } from '@/repositories/workspace-member-read.repo';
import { WorkspaceService } from '@/services/workspace.service';

export default fp(async (app) => {
  const workspaceService = new WorkspaceService(
    new WorkspaceRepository(),
    new WorkspaceMemberRepository(),
    new WorkspaceMemberReadRepository(),
    new BoardReadRepository()
  );
  app.decorate('workspaceService', workspaceService);
});
