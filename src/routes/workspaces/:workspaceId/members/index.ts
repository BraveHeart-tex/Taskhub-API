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
