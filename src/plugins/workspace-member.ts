import fp from 'fastify-plugin';
import { UserRepository } from '@/repositories/user.repo';
import { WorkspaceRepository } from '@/repositories/workspace.repo';
import { WorkspaceMemberRepository } from '@/repositories/workspace-member.repo';
import { WorkspaceMemberService } from '@/services/workspace-member.service';

export default fp(async (app) => {
  const workspaceMemberService = new WorkspaceMemberService(
    new WorkspaceMemberRepository(),
    new WorkspaceRepository(),
    new UserRepository()
  );

  app.decorate('workspaceMemberService', workspaceMemberService);
});


