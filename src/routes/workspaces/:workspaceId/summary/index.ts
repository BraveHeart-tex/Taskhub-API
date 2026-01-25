import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '@/lib/require-auth';
import { workspaceRouteParamsSchema } from '../../schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        params: workspaceRouteParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.workspaceService.getWorkspaceSummary(
        user.id,
        request.params.workspaceId
      );

      return reply.send(result);
    }
  );
};

export default route;
