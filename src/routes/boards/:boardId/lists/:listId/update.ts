import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '@/http/guards/require-auth';
import { boardListPathParamsSchema, updateBoardListSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/',
    {
      schema: {
        params: boardListPathParamsSchema,
        body: updateBoardListSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.listService.updateList({
        boardId: request.params.boardId,
        listId: request.params.listId,
        currentUserId: user.id,
        title: request.body.title,
      });

      return reply.status(204).send();
    }
  );
};

export default route;
