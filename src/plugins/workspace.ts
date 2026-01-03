import fp from 'fastify-plugin';
import { WorkspaceRepo } from '../workspace/workspace.repo';
import { WorkspaceService } from '../workspace/workspace.service';

export default fp(async (app) => {
  const workspaceService = new WorkspaceService(new WorkspaceRepo(app.db));
  app.decorate('workspaceService', workspaceService);
});
