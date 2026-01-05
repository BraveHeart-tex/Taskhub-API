import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../http/guards/require-auth';
import {
  updateWorkspaceParamsSchema,
  updateWorkspaceSchema,
  workspaceSchema,
} from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/:id',
    {
      schema: {
        params: updateWorkspaceParamsSchema,
        body: updateWorkspaceSchema,
        response: {
          200: workspaceSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const { id } = request.params;
      const { name } = request.body;

      const updatedWorkspace = await app.workspaceService.update({
        workspaceId: id,
        changes: { name },
        currentUserId: user.id,
      });

      reply.status(200).send(updatedWorkspace);
    }
  );
};

export default route;
