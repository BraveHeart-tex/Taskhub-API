import fp from 'fastify-plugin';
import { WorkspaceRepository } from '@/repositories/workspace.repo';
import { WorkspaceMemberRepository } from '@/repositories/workspace-member.repo';
import { WorkspaceService } from '@/services/workspace.service';

export default fp(async (app) => {
  const workspaceService = new WorkspaceService(
    new WorkspaceRepository(),
    new WorkspaceMemberRepository()
  );
  app.decorate('workspaceService', workspaceService);
});
