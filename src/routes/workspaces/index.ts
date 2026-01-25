import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import {
  createWorkspaceSchema,
  workspacePreviewResponseSchema,
  workspaceSchema,
} from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['Workspaces'],
        summary: 'List workspaces',
        description:
          'Returns all workspaces the authenticated user is a member of.\n\n' +
          'The response contains lightweight workspace previews suitable for list views and navigation.',
        response: {
          [HttpStatus.OK]: workspacePreviewResponseSchema,
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
        tags: ['Workspaces'],
        summary: 'Create workspace',
        description:
          'Creates a new workspace and assigns the authenticated user as the owner.\n\n' +
          'The newly created workspace is returned in full.',
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
