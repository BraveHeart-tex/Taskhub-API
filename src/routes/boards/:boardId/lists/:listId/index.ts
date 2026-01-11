import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '@/lib/require-auth';
import { listRouteParamsSchema, updateBoardListSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/',
    {
      schema: {
        params: listRouteParamsSchema,
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

  app.delete(
    '/',
    {
      schema: {
        params: listRouteParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.listService.deleteList({
        currentUserId: user.id,
        listId: request.params.listId,
        boardId: request.params.boardId,
      });

      return reply.status(204).send();
    }
  );
};

export default route;
