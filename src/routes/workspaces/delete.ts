import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../lib/require-auth';
import { deleteWorkspaceParamsSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/:id',
    {
      schema: {
        params: deleteWorkspaceParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const workspaceId = request.params.id;

      await app.workspaceService.delete(user.id, workspaceId);

      return reply.status(204).send();
    }
  );
};

export default route;
