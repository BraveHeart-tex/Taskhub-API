import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../lib/require-auth';
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
      const { user } = requireAuth(request);

      const { name } = request.body;

      const workspace = await app.workspaceService.create({
        name,
        ownerId: user.id,
      });

      return reply.status(201).send(workspace);
    }
  );
};

export default route;
