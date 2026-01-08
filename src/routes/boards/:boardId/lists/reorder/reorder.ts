import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '@/lib/require-auth';
import { boardIdPathParamsSchema } from '../../schema';
import { reOrderListsBodySchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        params: boardIdPathParamsSchema,
        body: reOrderListsBodySchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.listService.reorderLists({
        currentUserId: user.id,
        boardId: request.params.boardId,
        items: request.body.lists,
      });

      return reply.status(204).send();
    }
  );
};

export default route;
