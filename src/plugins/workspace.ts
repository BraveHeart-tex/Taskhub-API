import fp from 'fastify-plugin';
import { WorkspaceRepository } from '../workspace/workspace.repo';
import { WorkspaceService } from '../workspace/workspace.service';

export default fp(async (app) => {
  const workspaceService = new WorkspaceService(new WorkspaceRepository(app.db));
  app.decorate('workspaceService', workspaceService);
});
