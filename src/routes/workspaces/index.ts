import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { createWorkspaceSchema, workspaceSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        response: {
          [HttpStatus.OK]: workspaceSchema
            .extend({ isCurrentUserOwner: z.boolean() })
            .array(),
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.workspaceService.getWorkspacesForUser(user.id);

      return reply.status(HttpStatus.OK).send(result);
    }
  );

  app.post(
    '/',
    {
      schema: {
        body: createWorkspaceSchema,
        response: {
          [HttpStatus.CREATED]: workspaceSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const { name } = request.body;

      const workspace = await app.workspaceService.createWorkspace({
        name,
        ownerId: user.id,
      });

      return reply.status(HttpStatus.CREATED).send(workspace);
    }
  );
};

export default route;
