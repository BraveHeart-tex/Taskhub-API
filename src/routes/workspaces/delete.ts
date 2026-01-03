import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UnauthenticatedError } from '../../domain/auth/auth.errors';
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
      if (!request.user || !request.session?.id) {
        throw new UnauthenticatedError();
      }

      const workspaceId = request.params.id;
      const currentUserId = request.user.id;

      await app.workspaceService.delete(currentUserId, workspaceId);

      return reply.status(204).send();
    }
  );
};

export default route;
