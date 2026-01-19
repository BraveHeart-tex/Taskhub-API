import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { workspaceRouteParamsSchema } from '@/routes/workspaces/schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/',
    {
      schema: {
        params: workspaceRouteParamsSchema.extend({
          userId: z.uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.workspaceMemberService.deleteWorkspaceMember(user.id, {
        workspaceId: request.params.workspaceId,
        userId: request.params.userId,
      });

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );
};

export default route;
