import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { workspaceRouteParamsSchema } from '../../schema';
import {
  workspaceMemberCreateDtoSchema,
  workspaceMemberListDtoSchema,
  workspaceMemberUpdateRoleDtoSchema,
} from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['Workspaces'],
        summary: 'List workspace members',
        description:
          'Returns all members of a workspace the authenticated user has access to.\n\n' +
          'Each member entry includes the user and their assigned role within the workspace.',
        params: workspaceRouteParamsSchema,
        response: {
          [HttpStatus.OK]: workspaceMemberListDtoSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.workspaceMemberService.getWorkspaceMembers(
        request.params.workspaceId,
        user.id
      );

      return reply.status(HttpStatus.OK).send(result);
    }
  );

  app.post(
    '/',
    {
      schema: {
        tags: ['Workspaces'],
        summary: 'Add workspace member',
        description:
          'Adds a user to a workspace with the specified role.\n\n' +
          'Only users with sufficient permissions may add new members.',
        params: workspaceRouteParamsSchema,
        body: workspaceMemberCreateDtoSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.workspaceMemberService.addMember(user.id, {
        workspaceId: request.params.workspaceId,
        userId: request.body.userId,
        role: request.body.role,
      });

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );

  app.patch(
    '/:userId',
    {
      schema: {
        tags: ['Workspaces'],
        summary: 'Update workspace member role',
        description:
          'Updates the role of an existing workspace member.\n\n' +
          'Only users with sufficient permissions may modify member roles.',
        params: workspaceRouteParamsSchema.extend({
          userId: z.uuid(),
        }),
        body: workspaceMemberUpdateRoleDtoSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.workspaceMemberService.updateWorkspaceMemberRole(user.id, {
        workspaceId: request.params.workspaceId,
        userId: request.params.userId,
        role: request.body.role,
      });

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );
};

export default route;
