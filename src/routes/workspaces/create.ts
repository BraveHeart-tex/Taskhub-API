import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UnauthenticatedError } from '../../domain/auth/auth.errors';
import { createWorkspaceSchema, workspaceSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        body: createWorkspaceSchema,
        response: {
          201: workspaceSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.user || !request.session?.id) {
        throw new UnauthenticatedError();
      }

      const { name } = request.body;

      const workspace = await app.workspaceService.create({
        name,
        ownerId: request.user.id,
      });

      return reply.status(201).send(workspace);
    }
  );
};

export default route;
