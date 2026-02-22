import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '@/lib/require-auth';
import { workspaceRouteParamsSchema } from '../schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['Workspaces'],
        summary: 'Get workspace summary',
        description:
          'Returns a lightweight summary of a workspace the authenticated user has access to.\n\n' +
          'This endpoint is intended for quick lookups and UI contexts where full workspace details are not required.',
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
