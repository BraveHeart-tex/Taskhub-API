import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import {
  updateWorkspaceSchema,
  workspaceRouteParamsSchema,
  workspaceSchema,
} from '../schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/',
    {
      schema: {
        params: workspaceRouteParamsSchema,
        body: updateWorkspaceSchema,
        response: {
          [HttpStatus.OK]: workspaceSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const { workspaceId } = request.params;
      const { name } = request.body;

      const updatedWorkspace = await app.workspaceService.updateWorkspace({
        workspaceId,
        changes: { name },
        currentUserId: user.id,
      });

      return reply.status(HttpStatus.OK).send(updatedWorkspace);
    }
  );

  app.delete(
    '/',
    {
      schema: {
        params: workspaceRouteParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const workspaceId = request.params.workspaceId;

      await app.workspaceService.deleteWorkspace(user.id, workspaceId);

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );
};

export default route;
