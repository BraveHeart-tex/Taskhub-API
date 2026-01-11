import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '@/lib/require-auth';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceRouteParamsSchema,
  workspaceSchema,
} from './schema';

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

  app.patch(
    '/:id',
    {
      schema: {
        params: workspaceRouteParamsSchema,
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

      return reply.status(200).send(updatedWorkspace);
    }
  );

  app.delete(
    '/:id',
    {
      schema: {
        params: workspaceRouteParamsSchema,
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
