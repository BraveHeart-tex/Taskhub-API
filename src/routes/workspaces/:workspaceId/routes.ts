import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import {
  updateWorkspaceSchema,
  workspaceContextResponseSchema,
  workspaceSchema,
} from '../schema';
import { workspaceRouteParamsSchema } from './schema';

const workspaceRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['Workspaces'],
        summary: 'Get workspace',
        description:
          'Returns detailed context for a single workspace the authenticated user has access to.\n\n' +
          'The response includes workspace metadata and related contextual information required to render the workspace view.',
        params: workspaceRouteParamsSchema,
        response: {
          [HttpStatus.OK]: workspaceContextResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const workspaces = await app.workspaceService.getWorkspaceForUser(
        user.id,
        request.params.workspaceId
      );

      return reply.status(HttpStatus.OK).send(workspaces);
    }
  );

  app.patch(
    '/',
    {
      schema: {
        tags: ['Workspaces'],
        summary: 'Update workspace',
        description:
          'Updates mutable fields of an existing workspace.\n\n' +
          'Only users with sufficient permissions may perform this operation.',
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
        tags: ['Workspaces'],
        summary: 'Delete workspace',
        description:
          'Permanently deletes a workspace the authenticated user owns.\n\n' +
          'All associated data is removed as part of this operation and cannot be recovered.',
        params: workspaceRouteParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const workspaceId = request.params.workspaceId;

      await app.workspaceService.deleteWorkspace({
        userId: user.id,
        workspaceId,
      });

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );
};

export default workspaceRoutes;
