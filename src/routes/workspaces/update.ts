import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UnauthenticatedError } from '../../domain/auth/auth.errors';
import {
  updateWorkspaceParamsSchema,
  updateWorkspaceSchema,
  workspaceSchema,
} from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.put(
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
      if (!request.user || !request.session?.id) {
        throw new UnauthenticatedError();
      }

      const { id } = request.params;
      const { name } = request.body;

      const updatedWorkspace = await app.workspaceService.update({
        workspaceId: id,
        changes: { name },
        currentUserId: request.user.id,
      });

      reply.status(200).send(updatedWorkspace);
    }
  );
};

export default route;
